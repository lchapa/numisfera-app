package com.numisfera.api.service;

import com.numisfera.api.model.Auction;
import com.numisfera.api.model.Bid;
import com.numisfera.api.model.Coin;
import com.numisfera.api.model.User;
import com.numisfera.api.repository.AuctionRepository;
import com.numisfera.api.repository.BidRepository;
import com.numisfera.api.repository.CoinRepository;
import com.numisfera.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final CoinRepository coinRepository;
    private final UserRepository userRepository;

    @Autowired
    public AuctionServiceImpl(AuctionRepository auctionRepository, BidRepository bidRepository, 
                              CoinRepository coinRepository, UserRepository userRepository) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.coinRepository = coinRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Auction createAuction(Long coinId, Long sellerId, BigDecimal startingPrice, Integer durationSeconds) {
        Coin coin = coinRepository.findById(coinId)
                .orElseThrow(() -> new RuntimeException("Coin not found"));
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!coin.getOwner().getId().equals(seller.getId())) {
            throw new RuntimeException("Not the owner of the coin");
        }
        
        Optional<Auction> existingAuction = auctionRepository.findByCoinId(coinId);
        if (existingAuction.isPresent() && existingAuction.get().getActive()) {
            throw new RuntimeException("Active auction already exists for this coin");
        }

        Auction auction = existingAuction.orElse(new Auction());
        auction.setCoin(coin);
        auction.setSeller(seller);
        auction.setStartingPrice(startingPrice);
        auction.setCurrentBid(startingPrice);
        auction.setEndTime(Instant.now().plusSeconds(durationSeconds));
        auction.setActive(true);

        return auctionRepository.save(auction);
    }

    @Override
    public Optional<Auction> getAuctionByCoinId(Long coinId) {
        return auctionRepository.findByCoinId(coinId);
    }

    @Override
    public Bid placeBid(Long auctionId, Long bidderId, BigDecimal proxyAmount, BigDecimal resultingCurrentBid, String highestBidderWallet) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        User bidder = userRepository.findById(bidderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only save state if active
        if (!auction.getActive()) {
            throw new RuntimeException("Auction is not active");
        }
        
        // Save the bid history record
        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setBidder(bidder);
        bid.setMaxProxyAmount(proxyAmount);
        bid.setBidTime(Instant.now());
        Bid savedBid = bidRepository.save(bid);
        
        // Update auction state to match blockchain
        auction.setCurrentBid(resultingCurrentBid);
        auction.setHighestBidderWallet(highestBidderWallet);
        auctionRepository.save(auction);

        return savedBid;
    }

    @Override
    public void settleAuction(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));
        auction.setActive(false);
        auctionRepository.save(auction);

        if (auction.getHighestBidderWallet() != null && !auction.getHighestBidderWallet().isEmpty() 
            && !auction.getHighestBidderWallet().equals("0x0000000000000000000000000000000000000000")) {
            
            // Find the winning user by wallet and transfer the off-chain entity property
            userRepository.findByWalletAddress(auction.getHighestBidderWallet()).ifPresent(newOwner -> {
                Coin coin = auction.getCoin();
                coin.setOwner(newOwner);
                coinRepository.save(coin);
            });
        }
    }

    @Override
    public List<Bid> getUserBids(Long userId) {
        return bidRepository.findByBidderId(userId);
    }
}
