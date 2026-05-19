package org.example.shop.controller;

import org.example.shop.model.Order;
import org.example.shop.model.OrderItem;
import org.example.shop.model.Product;
import org.example.shop.repository.OrderRepository;
import org.example.shop.repository.ProductRepository;
import org.example.shop.service.UserDetailsImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Контроллер управления заказами.
 * <p>
 * Реализует создание заказа, получение списка заказов и просмотр заказа по идентификатору.
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;

    /**
     * Конструктор контроллера заказов.
     *
     * @param orderRepo   репозиторий заказов
     * @param productRepo репозиторий товаров
     */
    public OrderController(OrderRepository orderRepo, ProductRepository productRepo) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
    }

    /**
     * Оформляет заказ на основе переданного списка позиций.
     * <p>
     * Метод проверяет наличие товара на складе, уменьшает остатки,
     * заполняет имя и цену позиции и сохраняет заказ в базе данных.
     *
     * @param items список позиций заказа
     * @param user  авторизованный пользователь
     * @return созданный заказ или сообщение об ошибке
     */
    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody List<OrderItem> items,
                                        @AuthenticationPrincipal UserDetailsImpl user) {
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        try {
            for (OrderItem it : items) {
                Product p = productRepo.findById(it.getProductId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + it.getProductId()));
                if (p.getStock() < it.getQuantity()) {
                    return ResponseEntity.badRequest().body("Not enough stock for product " + p.getId());
                }
                p.setStock(p.getStock() - it.getQuantity());
                productRepo.save(p);

                it.setProductName(p.getName());
                it.setPrice(p.getPrice());
            }

            Order order = new Order(user.getId(), items);
            Order saved = orderRepo.save(order);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ex.getMessage());
        }
    }

    /**
     * Возвращает список всех заказов.
     *
     * @return список заказов
     */
    @GetMapping
    public List<Order> all() {
        return orderRepo.findAll();
    }

    /**
     * Возвращает заказ по идентификатору.
     *
     * @param id идентификатор заказа
     * @return найденный заказ или статус 404
     */
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOne(@PathVariable Long id) {
        return orderRepo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }
}