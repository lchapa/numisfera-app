package com.numisfera.api.repository;

import com.numisfera.api.model.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByBidderId(Long bidderId);
    List<Bid> findByAuctionIdOrderByMaxProxyAmountDesc(Long auctionId);
}
