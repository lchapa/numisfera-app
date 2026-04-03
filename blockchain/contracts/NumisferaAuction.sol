// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NumisferaAuction is ReentrancyGuard, Ownable {
    IERC721 public nftContract;
    
    uint256 public constant COMMISSION_PERCENT = 15;
    uint256 public platformTreasury;
    
    struct Auction {
        address seller;
        uint256 startingPrice;
        uint256 endingAt;
        address highestBidder;
        uint256 currentBid;
        uint256 highestProxyBid; // The max amount the winner is willing to pay
        bool active;
    }
    
    // tokenId => Auction
    mapping(uint256 => Auction) public auctions;
    
    // address => amount (for refunds/escrow)
    mapping(address => uint256) public pendingReturns;
    
    event AuctionCreated(uint256 indexed tokenId, address indexed seller, uint256 startingPrice, uint256 endingAt);
    event BidPlaced(uint256 indexed tokenId, address indexed bidder, uint256 maxSetup, uint256 newCurrentBid);
    event AuctionEnded(uint256 indexed tokenId, address indexed winner, uint256 winningPrice);
    
    error AuctionAlreadyActive();
    error NotTokenOwner();
    error AuctionNotActive();
    error AuctionEndedError();
    error SellerCannotBid();
    error BidTooLow();
    error AuctionNotYetEnded();
    
    constructor(address _nftContract) Ownable(msg.sender) {
        nftContract = IERC721(_nftContract);
    }
    
    function createAuction(uint256 tokenId, uint256 startingPrice, uint256 duration) external {
        if (nftContract.ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (auctions[tokenId].active) revert AuctionAlreadyActive();
        
        // Transfer NFT to this contract escrow
        nftContract.transferFrom(msg.sender, address(this), tokenId);
        
        uint256 endingAt = block.timestamp + duration;
        
        auctions[tokenId] = Auction({
            seller: msg.sender,
            startingPrice: startingPrice,
            endingAt: endingAt,
            highestBidder: address(0),
            currentBid: 0,
            highestProxyBid: 0,
            active: true
        });
        
        emit AuctionCreated(tokenId, msg.sender, startingPrice, endingAt);
    }
    
    function bid(uint256 tokenId) external payable nonReentrant {
        Auction storage auction = auctions[tokenId];
        
        if (!auction.active) revert AuctionNotActive();
        if (block.timestamp >= auction.endingAt) revert AuctionEndedError();
        if (msg.sender == auction.seller) revert SellerCannotBid();
        
        uint256 proxyAmount = msg.value;
        
        if (auction.highestBidder == address(0)) {
            if (proxyAmount < auction.startingPrice) revert BidTooLow();
            auction.highestBidder = msg.sender;
            auction.highestProxyBid = proxyAmount;
            auction.currentBid = auction.startingPrice; 
        } else {
            // Need to outbid current bid
            // (Wait, to outbid a proxy we need to check against their highestProxyBid, but first ensure it beats currentBid)
            // Example: current bid is 10, highest proxy is 100.
            // If I bid 50, it beats 10, but fails to beat 100. 
            // My 50 gets refunded, and current bid becomes 50 (or 51).
            if (proxyAmount <= auction.currentBid) revert BidTooLow();
            
            if (proxyAmount > auction.highestProxyBid) {
                // We beat the previous max
                address previousWinner = auction.highestBidder;
                uint256 previousMax = auction.highestProxyBid;
                
                // Set the new current bid
                // If I bid 150, and previous max was 100. The new current bid should be 100 + increment (e.g. 1 gwei) or just max of previous
                uint256 newBid = previousMax + 1 gwei; // Example increment
                if (newBid > proxyAmount) {
                    newBid = proxyAmount; // Cap
                }
                
                // Refund previous winner
                pendingReturns[previousWinner] += previousMax;
                
                auction.highestBidder = msg.sender;
                auction.highestProxyBid = proxyAmount;
                auction.currentBid = newBid;
            } else {
                // They didn't beat the current proxy's max
                // They get automatically outbid by the proxy algorithm
                uint256 newBid = proxyAmount + 1 gwei;
                if (newBid > auction.highestProxyBid) {
                    newBid = auction.highestProxyBid;
                }
                
                auction.currentBid = newBid;
                
                // Refund the current sender instantly using Escrow since they lost
                pendingReturns[msg.sender] += proxyAmount;
            }
        }
        
        emit BidPlaced(tokenId, msg.sender, proxyAmount, auction.currentBid);
    }
    
    function settleAuction(uint256 tokenId) external nonReentrant {
        Auction storage auction = auctions[tokenId];
        if (!auction.active) revert AuctionNotActive();
        if (block.timestamp < auction.endingAt) revert AuctionNotYetEnded();
        
        auction.active = false;
        
        if (auction.highestBidder != address(0)) {
            // Unsold, no winner? Refund is implicitly handled below
            uint256 finalPrice = auction.currentBid;
            uint256 lockedFunds = auction.highestProxyBid;
            
            // Refund the unspent difference to the winner
            uint256 difference = lockedFunds - finalPrice;
            if (difference > 0) {
                pendingReturns[auction.highestBidder] += difference;
            }
            
            // Calculate fractions
            uint256 commission = (finalPrice * COMMISSION_PERCENT) / 100;
            uint256 sellerShare = finalPrice - commission;
            
            platformTreasury += commission;
            pendingReturns[auction.seller] += sellerShare;
            
            // Transfer NFT to winner
            nftContract.transferFrom(address(this), auction.highestBidder, tokenId);
            
            emit AuctionEnded(tokenId, auction.highestBidder, finalPrice);
        } else {
            // Unsold. Return NFT to seller.
            nftContract.transferFrom(address(this), auction.seller, tokenId);
            emit AuctionEnded(tokenId, address(0), 0);
        }
    }
    
    // Withdrawal pattern
    function withdraw() external nonReentrant {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        pendingReturns[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }
    
    // Only owner
    function withdrawTreasury() external onlyOwner nonReentrant {
        uint256 amount = platformTreasury;
        platformTreasury = 0;
        
        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
    }
}
