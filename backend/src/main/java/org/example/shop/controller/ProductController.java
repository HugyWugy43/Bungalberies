package org.example.shop.controller;

import org.example.shop.model.Product;
import org.example.shop.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Контроллер управления товарами.
 * <p>
 * Предоставляет операции просмотра, добавления, редактирования и удаления товаров.
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository repo;

    /**
     * Конструктор контроллера товаров.
     *
     * @param repo репозиторий товаров
     */
    public ProductController(ProductRepository repo) {
        this.repo = repo;
    }

    /**
     * Возвращает список всех товаров.
     *
     * @return список товаров
     */
    @GetMapping
    public List<Product> all() {
        return repo.findAll();
    }

    /**
     * Возвращает товар по идентификатору.
     *
     * @param id идентификатор товара
     * @return найденный товар или статус 404
     */
    @GetMapping("/{id}")
    public ResponseEntity<Product> getOne(@PathVariable Long id) {
        return repo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Добавляет новый товар в каталог.
     *
     * @param p объект товара
     * @return сохраненный товар
     */
    @PostMapping
    public ResponseEntity<Product> add(@RequestBody Product p) {
        Product saved = repo.save(p);
        return ResponseEntity.ok(saved);
    }

    /**
     * Обновляет сведения о товаре.
     * <p>
     * Если товар существует, его поля заменяются новыми значениями.
     * Если товар не найден, создается новая запись с указанным идентификатором.
     *
     * @param id идентификатор товара
     * @param p  новые данные товара
     * @return сохраненный товар
     */
    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product p) {
        return repo.findById(id).map(ex -> {
            ex.setName(p.getName());
            ex.setDescription(p.getDescription());
            ex.setPrice(p.getPrice());
            ex.setQuantity(p.getQuantity());
            ex.setImageUrl(p.getImageUrl());
            Product saved = repo.save(ex);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> {
            p.setId(id);
            Product saved = repo.save(p);
            return ResponseEntity.ok(saved);
        });
    }

    /**
     * Удаляет товар по идентификатору.
     *
     * @param id идентификатор товара
     * @return статус 204 при успешном удалении или 404 при отсутствии товара
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}