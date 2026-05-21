package org.example.shop.model;

import jakarta.persistence.*;

/**
 * Справочник уровней прав доступа.
 */
@Entity
@Table(name = "access_levels")
public class AccessLevel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "access_level_id")
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    public AccessLevel() {}

    public AccessLevel(String name) {
        this.name = name;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
