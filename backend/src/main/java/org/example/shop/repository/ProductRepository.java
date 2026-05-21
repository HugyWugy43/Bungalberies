package org.example.shop.repository;

import org.example.shop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Репозиторий для работы с сущностью товара.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
}
