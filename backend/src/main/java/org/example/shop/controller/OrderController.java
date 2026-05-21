package org.example.shop.controller;

import org.example.shop.dto.GuestOrderRequest;
import org.example.shop.model.*;
import org.example.shop.repository.*;
import org.example.shop.service.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Контроллер управления заказами.
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final StatusRepository statusRepo;
    private final PaymentRepository paymentRepo;
    private final CartRepository cartRepo;

    public OrderController(OrderRepository orderRepo,
                           ProductRepository productRepo,
                           UserRepository userRepo,
                           StatusRepository statusRepo,
                           PaymentRepository paymentRepo,
                           CartRepository cartRepo) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.statusRepo = statusRepo;
        this.paymentRepo = paymentRepo;
        this.cartRepo = cartRepo;
    }

    @Transactional
    @PostMapping("/from-cart")
    public ResponseEntity<?> placeOrderFromCart(@AuthenticationPrincipal UserDetailsImpl user) {
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        List<Cart> cartItems = cartRepo.findByUserId(user.getId());
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body("Cart is empty");
        }

        try {
            User dbUser = userRepo.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<OrderItem> orderItems = new ArrayList<>();
            double total = 0;

            for (Cart cartItem : cartItems) {
                Product p = productRepo.findById(cartItem.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + cartItem.getProduct().getId()));
                if (p.getQuantity() < cartItem.getQuantity()) {
                    return ResponseEntity.badRequest().body("Not enough stock for product " + p.getId());
                }
                p.setQuantity(p.getQuantity() - cartItem.getQuantity());
                productRepo.save(p);

                OrderItem item = new OrderItem(null, p, p.getPrice(), cartItem.getQuantity());
                orderItems.add(item);
                total += p.getPrice() * cartItem.getQuantity();
            }

            Status newStatus = statusRepo.findByName("Новый")
                    .orElseGet(() -> {
                        Status s = new Status("Новый");
                        return statusRepo.save(s);
                    });

            Order order = new Order();
            order.setUser(dbUser);
            order.setStatus(newStatus);
            order.setTotalAmount(total);
            order.setItems(orderItems);

            for (OrderItem item : orderItems) {
                item.setOrder(order);
            }

            Order saved = orderRepo.save(order);
            cartRepo.deleteByUserId(user.getId());
            return ResponseEntity.ok(saved);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @Transactional
    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody List<OrderItem> items,
                                        @AuthenticationPrincipal UserDetailsImpl user) {
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            User dbUser = userRepo.findById(user.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<OrderItem> orderItems = new ArrayList<>();
            double total = 0;

            for (OrderItem it : items) {
                Product p = productRepo.findById(it.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + it.getProduct().getId()));
                if (p.getQuantity() < it.getQuantity()) {
                    return ResponseEntity.badRequest().body("Not enough stock for product " + p.getId());
                }
                p.setQuantity(p.getQuantity() - it.getQuantity());
                productRepo.save(p);

                OrderItem item = new OrderItem(null, p, p.getPrice(), it.getQuantity());
                orderItems.add(item);
                total += p.getPrice() * it.getQuantity();
            }

            Status newStatus = statusRepo.findByName("Новый")
                    .orElseGet(() -> {
                        Status s = new Status("Новый");
                        return statusRepo.save(s);
                    });

            Order order = new Order();
            order.setUser(dbUser);
            order.setStatus(newStatus);
            order.setTotalAmount(total);
            order.setItems(orderItems);

            for (OrderItem item : orderItems) {
                item.setOrder(order);
            }

            Order saved = orderRepo.save(order);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @Transactional
    @PostMapping("/guest")
    public ResponseEntity<?> placeGuestOrder(@RequestBody GuestOrderRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body("Order items cannot be empty");
        }
        if (request.getCustomerName() == null || request.getCustomerName().isBlank()) {
            return ResponseEntity.badRequest().body("Customer name is required");
        }
        if (request.getCustomerPhone() == null || request.getCustomerPhone().isBlank()) {
            return ResponseEntity.badRequest().body("Customer phone is required");
        }

        try {
            List<OrderItem> orderItems = new ArrayList<>();
            double total = 0;

            for (GuestOrderRequest.OrderItemDto dto : request.getItems()) {
                Product p = productRepo.findById(dto.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + dto.getProductId()));
                if (p.getQuantity() < dto.getQuantity()) {
                    return ResponseEntity.badRequest().body("Not enough stock for product " + p.getId());
                }
                p.setQuantity(p.getQuantity() - dto.getQuantity());
                productRepo.save(p);

                OrderItem item = new OrderItem(null, p, p.getPrice(), dto.getQuantity());
                orderItems.add(item);
                total += p.getPrice() * dto.getQuantity();
            }

            Status newStatus = statusRepo.findByName("Новый")
                    .orElseGet(() -> {
                        Status s = new Status("Новый");
                        return statusRepo.save(s);
                    });

            Order order = new Order();
            order.setStatus(newStatus);
            order.setTotalAmount(total);
            order.setCustomerName(request.getCustomerName());
            order.setCustomerEmail(request.getCustomerEmail());
            order.setCustomerPhone(request.getCustomerPhone());
            order.setShippingAddress(request.getShippingAddress());
            order.setGuest(true);
            order.setItems(orderItems);

            for (OrderItem item : orderItems) {
                item.setOrder(order);
            }

            Order saved = orderRepo.save(order);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    @GetMapping("/track")
    public ResponseEntity<?> trackOrders(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone) {

        if ((email == null || email.isBlank()) && (phone == null || phone.isBlank())) {
            return ResponseEntity.badRequest().body("Provide email or phone to track orders");
        }

        List<Order> orders = new ArrayList<>();
        if (email != null && !email.isBlank()) {
            orders.addAll(orderRepo.findByCustomerEmail(email));
        }
        if (phone != null && !phone.isBlank()) {
            List<Order> byPhone = orderRepo.findByCustomerPhone(phone);
            for (Order o : byPhone) {
                if (!orders.contains(o)) {
                    orders.add(o);
                }
            }
        }

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders(@AuthenticationPrincipal UserDetailsImpl user) {
        if (user == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        List<Order> orders = orderRepo.findByUserId(user.getId());
        return ResponseEntity.ok(orders);
    }

    @GetMapping
    public List<Order> all() {
        return orderRepo.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOne(@PathVariable Long id) {
        return orderRepo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}
