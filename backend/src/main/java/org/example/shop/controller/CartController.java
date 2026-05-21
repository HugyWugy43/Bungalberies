package org.example.shop.controller;

import org.example.shop.model.Cart;
import org.example.shop.model.Product;
import org.example.shop.model.User;
import org.example.shop.repository.CartRepository;
import org.example.shop.repository.ProductRepository;
import org.example.shop.repository.UserRepository;
import org.example.shop.service.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartRepository cartRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    public CartController(CartRepository cartRepo, ProductRepository productRepo, UserRepository userRepo) {
        this.cartRepo = cartRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
    }

    @GetMapping
    public ResponseEntity<?> getCart(@AuthenticationPrincipal UserDetailsImpl user) {
        if (user != null) {
            return ResponseEntity.ok(cartRepo.findByUserId(user.getId()));
        }
        return ResponseEntity.ok(List.of());
    }

    @Transactional
    @PostMapping
    public ResponseEntity<?> addToCart(@RequestBody Map<String, Object> body,
                                       @AuthenticationPrincipal UserDetailsImpl user) {
        Long productId = Long.valueOf(body.get("productId").toString());
        int quantity = body.containsKey("quantity") ? Integer.parseInt(body.get("quantity").toString()) : 1;

        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (user != null) {
            User dbUser = userRepo.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Optional<Cart> existing = cartRepo.findByUserIdAndProductId(dbUser.getId(), productId);
            if (existing.isPresent()) {
                Cart cart = existing.get();
                cart.setQuantity(cart.getQuantity() + quantity);
                Cart saved = cartRepo.save(cart);
                return buildCartResponse(saved);
            }
            Cart saved = cartRepo.save(new Cart(dbUser, product, quantity));
            return buildCartResponse(saved);
        }

        return ResponseEntity.ok(Map.of(
                "productId", productId,
                "name", product.getName(),
                "price", product.getPrice(),
                "quantity", quantity,
                "guest", true
        ));
    }

    @Transactional
    @PutMapping("/{cartId}")
    public ResponseEntity<?> updateQuantity(@PathVariable Long cartId,
                                            @RequestBody Map<String, Integer> body,
                                            @AuthenticationPrincipal UserDetailsImpl user) {
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cart.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        cart.setQuantity(body.get("quantity"));
        return ResponseEntity.ok(cartRepo.save(cart));
    }

    @Transactional
    @DeleteMapping("/{cartId}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long cartId,
                                            @AuthenticationPrincipal UserDetailsImpl user) {
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");

        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cart.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("Access denied");
        }

        cartRepo.delete(cart);
        return ResponseEntity.noContent().build();
    }

    @Transactional
    @DeleteMapping
    public ResponseEntity<?> clearCart(@AuthenticationPrincipal UserDetailsImpl user) {
        if (user == null) return ResponseEntity.status(401).body("Unauthorized");
        cartRepo.deleteByUserId(user.getId());
        return ResponseEntity.noContent().build();
    }

    private ResponseEntity<Map<String, Object>> buildCartResponse(Cart cart) {
        return ResponseEntity.ok(Map.of(
                "id", cart.getId(),
                "productId", cart.getProduct().getId(),
                "productName", cart.getProduct().getName(),
                "price", cart.getProduct().getPrice(),
                "quantity", cart.getQuantity()
        ));
    }
}
