import { expect } from "chai";
import hre from "hardhat";

describe("NumisferaAuction Smart Contract", function () {
    let nft, auction;
    let owner, seller, bidder1, bidder2;
    const FIRST_COIN_ID = 1;
    const STARTING_PRICE = hre.ethers.parseEther("0.1"); // 0.1 ETH
    const DURATION = 3600; // 1 hour

    beforeEach(async function () {
        [owner, seller, bidder1, bidder2] = await hre.ethers.getSigners();

        // 1. Deploy NFT 
        const NumisferaNFT = await hre.ethers.getContractFactory("NumisferaNFT");
        nft = await NumisferaNFT.deploy(owner.address);

        // 2. Deploy Auction giving the NFT address
        const NumisferaAuction = await hre.ethers.getContractFactory("NumisferaAuction");
        auction = await NumisferaAuction.deploy(await nft.getAddress());

        // 3. Mint an NFT to the seller
        await nft.connect(owner).mintPiece(seller.address, "ipfs://metadata/1");

        // 4. Seller approves Auction contract
        await nft.connect(seller).approve(await auction.getAddress(), FIRST_COIN_ID);
    });

    describe("Auction Creation", function () {
        it("Should allow the owner to create an auction", async function () {
            await expect(auction.connect(seller).createAuction(FIRST_COIN_ID, STARTING_PRICE, DURATION))
                .to.emit(auction, "AuctionCreated");

            const auctionData = await auction.auctions(FIRST_COIN_ID);
            expect(auctionData.active).to.be.true;
            expect(auctionData.seller).to.equal(seller.address);
            expect(auctionData.startingPrice).to.equal(STARTING_PRICE);
            
            // Check that NFT is now locked in Escrow (auction contract)
            expect(await nft.ownerOf(FIRST_COIN_ID)).to.equal(await auction.getAddress());
        });

        it("Should fail if caller is not the owner", async function () {
            await expect(auction.connect(bidder1).createAuction(FIRST_COIN_ID, STARTING_PRICE, DURATION))
                .to.be.revertedWithCustomError(auction, "NotTokenOwner");
        });
    });

    describe("Proxy Bidding Algorithm", function () {
        beforeEach(async function () {
            await auction.connect(seller).createAuction(FIRST_COIN_ID, STARTING_PRICE, DURATION);
        });

        it("First bid should just lock the max proxy but keep currentBid at starting price", async function () {
            const bidder1Max = hre.ethers.parseEther("1.0"); // Max bid of 1 ETH
            
            await expect(auction.connect(bidder1).bid(FIRST_COIN_ID, { value: bidder1Max }))
                .to.emit(auction, "BidPlaced")
                .withArgs(FIRST_COIN_ID, bidder1.address, bidder1Max, STARTING_PRICE); // Current bid is 0.1 ETH

            const auctionData = await auction.auctions(FIRST_COIN_ID);
            expect(auctionData.highestBidder).to.equal(bidder1.address);
            expect(auctionData.highestProxyBid).to.equal(bidder1Max);
            expect(auctionData.currentBid).to.equal(STARTING_PRICE); // Started at 0.1
        });

        it("Second bid (lower max) should be automatically outbid by first proxy", async function () {
            // Bidder 1 sets max to 1.0 ETH
            const bidder1Max = hre.ethers.parseEther("1.0");
            await auction.connect(bidder1).bid(FIRST_COIN_ID, { value: bidder1Max });

            // Bidder 2 sets max to 0.5 ETH
            const bidder2Max = hre.ethers.parseEther("0.5");
            await auction.connect(bidder2).bid(FIRST_COIN_ID, { value: bidder2Max });

            const auctionData = await auction.auctions(FIRST_COIN_ID);
            
            // Bidder 1 is still winning
            expect(auctionData.highestBidder).to.equal(bidder1.address);
            expect(auctionData.highestProxyBid).to.equal(bidder1Max);
            
            // Current bid moves to 0.5 + 1 gwei
            const expectedCurrentBid = bidder2Max + hre.ethers.parseUnits("1", "gwei");
            expect(auctionData.currentBid).to.equal(expectedCurrentBid);

            // Bidder 2 inherently lost, check if they were added to escrow refunds
            expect(await auction.pendingReturns(bidder2.address)).to.equal(bidder2Max);
        });

        it("Third bid (higher max) should overthrow previous proxy", async function () {
            // Bidder 1 sets max to 1.0 ETH
            const bidder1Max = hre.ethers.parseEther("1.0");
            await auction.connect(bidder1).bid(FIRST_COIN_ID, { value: bidder1Max });

            // Bidder 2 sets max to 2.0 ETH
            const bidder2Max = hre.ethers.parseEther("2.0");
            await auction.connect(bidder2).bid(FIRST_COIN_ID, { value: bidder2Max });

            const auctionData = await auction.auctions(FIRST_COIN_ID);
            
            // Bidder 2 is now winning
            expect(auctionData.highestBidder).to.equal(bidder2.address);
            
            // Current bid is moved barely above Bidder 1's max (1.0 + 1 gwei)
            const expectedCurrentBid = bidder1Max + hre.ethers.parseUnits("1", "gwei");
            expect(auctionData.currentBid).to.equal(expectedCurrentBid);

            // Bidder 1's fund should be resting in Refunds
            expect(await auction.pendingReturns(bidder1.address)).to.equal(bidder1Max);
        });
    });

    describe("Settlement", function() {
        beforeEach(async function () {
            // Auction created to end in 1 hour
            await auction.connect(seller).createAuction(FIRST_COIN_ID, STARTING_PRICE, 3600);
            
            // Bidder 1 bids 1 ETH (Current bid 0.1)
            await auction.connect(bidder1).bid(FIRST_COIN_ID, { value: hre.ethers.parseEther("1.0") });
        });

        it("Should allow ending auction when time expires and distribute funds", async function () {
            // Fast forward time by 1 hour + 1 second
            await hre.ethers.provider.send("evm_increaseTime", [3601]); // move 1 hour
            await hre.ethers.provider.send("evm_mine");

            await auction.connect(owner).settleAuction(FIRST_COIN_ID);

            const auctionData = await auction.auctions(FIRST_COIN_ID);
            expect(auctionData.active).to.be.false;

            // NFT goes to Bidder 1
            expect(await nft.ownerOf(FIRST_COIN_ID)).to.equal(bidder1.address);

            // Fund distribution
            // Bidder 1 gets a refund of the unspent proxy (1.0 - 0.1 = 0.9)
            const unspent = hre.ethers.parseEther("0.9");
            expect(await auction.pendingReturns(bidder1.address)).to.equal(unspent);

            // Commission (15% of 0.1 = 0.015)
            const commission = (STARTING_PRICE * 15n) / 100n;
            expect(await auction.platformTreasury()).to.equal(commission);

            // Seller (85% of 0.1 = 0.085)
            const sellerShare = STARTING_PRICE - commission;
            expect(await auction.pendingReturns(seller.address)).to.equal(sellerShare);
        });
    });
});
