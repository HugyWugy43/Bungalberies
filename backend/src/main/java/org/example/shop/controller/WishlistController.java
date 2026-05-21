package org.example.shop.controller;

import org.example.shop.model.Product;
import org.example.shop.model.User;
import org.example.shop.model.WishlistItem;
import org.example.shop.repository.ProductRepository;
import org.example.shop.repository.UserRepository;
import org.example.shop.repository.WishlistRepository;
import org.example.shop.service.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistRepository wishlistRepo;
    private final UserRepository userRepo;
    private final ProductRepository productRepo;

    public WishlistController(WishlistRepository wishlistRepo, UserRepository userRepo, ProductRepository productRepo) {
        this.wishlistRepo = wishlistRepo;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
    }

    @GetMapping
    public ResponseEntity<?> getWishlist(@AuthenticationPrincipal UserDetailsImpl user) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        List<WishlistItem> items = wishlistRepo.findByUserId(user.getId());
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<?> addToWishlist(@RequestBody Map<String, Long> body,
                                           @AuthenticationPrincipal UserDetailsImpl user) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        Long productId = body.get("productId");
        if (productId == null) return ResponseEntity.badRequest().body(Map.of("message", "productId is required"));

        if (wishlistRepo.existsByUserIdAndProductId(user.getId(), productId)) {
            return ResponseEntity.ok(Map.of("message", "Already in wishlist"));
        }

        User dbUser = userRepo.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        WishlistItem item = new WishlistItem(dbUser, product);
        WishlistItem saved = wishlistRepo.save(item);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long productId,
                                                @AuthenticationPrincipal UserDetailsImpl user) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        wishlistRepo.deleteByUserIdAndProductId(user.getId(), productId);
        return ResponseEntity.noContent().build();
    }
}
