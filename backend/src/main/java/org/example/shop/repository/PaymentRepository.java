package org.example.shop.repository;

import org.example.shop.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Репозиторий для работы с платежами.
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
