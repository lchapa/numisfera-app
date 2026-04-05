package com.numisfera.api.controller;

import com.numisfera.api.model.Auction;
import com.numisfera.api.model.Bid;
import com.numisfera.api.model.User;
import com.numisfera.api.service.AuctionService;
import com.numisfera.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auctions")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class AuctionController {

    private final AuctionService auctionService;
    private final UserRepository userRepository;

    @Autowired
    public AuctionController(AuctionService auctionService, UserRepository userRepository) {
        this.auctionService = auctionService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        return userRepository.findByEmail(username)
                .orElseGet(() -> userRepository.findByWalletAddress(username).orElse(null));
    }

    @PostMapping("/{coinId}")
    public ResponseEntity<?> createAuction(@PathVariable Long coinId, @RequestBody Map<String, Object> payload) {
        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            BigDecimal startingPrice = new BigDecimal(payload.get("startingPrice").toString());
            Integer durationSeconds = Integer.parseInt(payload.get("durationSeconds").toString());

            Auction auction = auctionService.createAuction(coinId, user.getId(), startingPrice, durationSeconds);
            return ResponseEntity.ok(auction);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating auction: " + e.getMessage());
        }
    }

    @GetMapping("/{coinId}")
    public ResponseEntity<?> getAuctionDetails(@PathVariable Long coinId) {
        Optional<Auction> auction = auctionService.getAuctionByCoinId(coinId);
        return auction.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{auctionId}/bid")
    public ResponseEntity<?> recordBid(@PathVariable Long auctionId, @RequestBody Map<String, Object> payload) {
        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }

            BigDecimal proxyAmount = new BigDecimal(payload.get("proxyAmount").toString());
            BigDecimal resultingCurrentBid = new BigDecimal(payload.get("currentBid").toString());
            String highestBidderWallet = payload.get("highestBidderWallet") != null ? payload.get("highestBidderWallet").toString() : null;

            Bid bid = auctionService.placeBid(auctionId, user.getId(), proxyAmount, resultingCurrentBid, highestBidderWallet);
            return ResponseEntity.ok(bid);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error recording bid: " + e.getMessage());
        }
    }

    @PutMapping("/{auctionId}/settle")
    public ResponseEntity<?> settleAuction(@PathVariable Long auctionId) {
        try {
            auctionService.settleAuction(auctionId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error settling auction: " + e.getMessage());
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getUserBids() {
        try {
            User user = getAuthenticatedUser();
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }
            List<Bid> bids = auctionService.getUserBids(user.getId());
            return ResponseEntity.ok(bids);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
