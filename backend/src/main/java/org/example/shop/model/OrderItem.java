package org.example.shop.model;

import jakarta.persistence.*;

/**
 * Сущность позиции заказа.
 * <p>
 * Содержит сведения о товаре, его цене и количестве в заказе.
 */
@Entity
@Table(name = "order_items")
public class OrderItem {

    /** Уникальный идентификатор позиции. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Идентификатор товара. */
    private Long productId;

    /** Название товара на момент оформления заказа. */
    private String productName;

    /** Цена единицы товара. */
    private double price;

    /** Количество товара в заказе. */
    private int quantity;

    /** Конструктор по умолчанию. */
    public OrderItem() {}

    /**
     * Создает позицию заказа.
     *
     * @param productId   идентификатор товара
     * @param productName название товара
     * @param price       цена товара
     * @param quantity    количество
     */
    public OrderItem(Long productId, String productName, double price, int quantity) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }
}