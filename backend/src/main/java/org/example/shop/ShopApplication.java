package org.example.shop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Точка входа в приложение интернет-магазина.
 * <p>
 * Запускает Spring Boot приложение и инициализирует все компоненты системы.
 */
@SpringBootApplication
public class ShopApplication {

    /**
     * Главный метод запуска приложения.
     *
     * @param args аргументы командной строки
     */
    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }
}