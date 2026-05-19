package org.example.shop.model;

import jakarta.persistence.*;

/**
 * Сущность пользователя системы.
 * <p>
 * Содержит данные для аутентификации, а также роль доступа.
 */
@Entity
@Table(name = "users")
public class User {

    /** Уникальный идентификатор пользователя. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Уникальное имя пользователя. */
    @Column(unique = true)
    private String username;

    /** Хешированный пароль пользователя. */
    private String password;

    /** Роль пользователя в системе, например ROLE_USER или ROLE_ADMIN. */
    private String role;

    /** Конструктор по умолчанию. */
    public User() {}

    /**
     * Создает пользователя с заданными данными.
     *
     * @param username имя пользователя
     * @param password хешированный пароль
     * @param role     роль пользователя
     */
    public User(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}