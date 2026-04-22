package org.example.shop.repository;

import org.example.shop.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Репозиторий для работы с сущностью пользователя.
 * <p>
 * Предоставляет методы доступа к данным пользователей,
 * включая поиск по имени пользователя и проверку его уникальности.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Ищет пользователя по имени.
     *
     * @param username имя пользователя
     * @return объект Optional с найденным пользователем
     */
    Optional<User> findByUsername(String username);

    /**
     * Проверяет существование пользователя с заданным именем.
     *
     * @param username имя пользователя
     * @return true, если пользователь существует, иначе false
     */
    boolean existsByUsername(String username);
}