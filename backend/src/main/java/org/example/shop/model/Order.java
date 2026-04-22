package org.example.shop.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Сущность заказа.
 * <p>
 * Хранит сведения о пользователе, времени создания и составе заказа.
 */
@Entity
@Table(name = "orders")
public class Order {

    /** Уникальный идентификатор заказа. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Идентификатор пользователя, оформившего заказ. */
    private Long userId;

    /** Дата и время создания заказа. */
    private LocalDateTime createdAt;

    /** Список позиций, входящих в заказ. */
    @OneToMany(cascade = CascadeType.ALL)
    private List<OrderItem> items;

    /**
     * Конструктор по умолчанию.
     * <p>
     * Инициализирует время создания заказа текущим моментом.
     */
    public Order() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Создает заказ с заданным пользователем и списком товаров.
     *
     * @param userId идентификатор пользователя
     * @param items   список позиций заказа
     */
    public Order(Long userId, List<OrderItem> items) {
        this.userId = userId;
        this.items = items;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}