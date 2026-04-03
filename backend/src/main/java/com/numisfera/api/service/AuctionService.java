package com.numisfera.api.service;

import com.numisfera.api.model.Auction;
import com.numisfera.api.model.Bid;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface AuctionService {
    Auction createAuction(Long coinId, Long sellerId, BigDecimal startingPrice, Integer durationSeconds);
    Optional<Auction> getAuctionByCoinId(Long coinId);
    Bid placeBid(Long auctionId, Long bidderId, BigDecimal proxyAmount, BigDecimal resultingCurrentBid);
    void settleAuction(Long auctionId);
    List<Bid> getUserBids(Long userId);
}
