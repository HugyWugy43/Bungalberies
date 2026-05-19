package org.example.shop.model;

import jakarta.persistence.*;

/**
 * Сущность товара интернет-магазина.
 * <p>
 * Содержит основные данные о товаре: название, описание, цену и остаток на складе.
 */
@Entity
@Table(name = "products")
public class Product {

    /** Уникальный идентификатор товара. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Название товара. */
    private String name;

    /** Описание товара. */
    private String description;

    /** Цена товара. */
    private double price;

    /** Количество товара на складе. */
    private int stock;

    /** Конструктор по умолчанию. */
    public Product() {}

    /**
     * Создает товар с заданными параметрами.
     *
     * @param name        название товара
     * @param description описание товара
     * @param price       цена товара
     * @param stock       остаток на складе
     */
    public Product(String name, String description, double price, int stock) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
}