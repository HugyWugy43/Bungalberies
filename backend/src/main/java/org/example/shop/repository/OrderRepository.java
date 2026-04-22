package org.example.shop.repository;

import org.example.shop.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Репозиторий для работы с сущностью заказа.
 * <p>
 * Обеспечивает стандартные операции CRUD и доступ к данным заказов
 * через механизм Spring Data JPA.
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
}