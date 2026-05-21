package org.example.shop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.shop.model.Product;
import org.example.shop.model.User;
import org.example.shop.repository.CartRepository;
import org.example.shop.repository.OrderRepository;
import org.example.shop.repository.ProductRepository;
import org.example.shop.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Тесты контроллера товаров и админ-панели.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();

        User admin = new User("admin", passwordEncoder.encode("adminpass"), "ROLE_ADMIN");
        userRepository.save(admin);

        User user = new User("user", passwordEncoder.encode("userpass"), "ROLE_USER");
        userRepository.save(user);
    }

    @Test
    @DisplayName("Кейс: Добавление товара через админ-панель")
    void addProduct_admin_success() throws Exception {
        Map<String, Object> product = Map.of(
                "name", "New Product",
                "description", "Test Description",
                "price", 299.0,
                "quantity", 10
        );

        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(product)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Product"))
                .andExpect(jsonPath("$.price").value(299.0));
    }

    @Test
    @DisplayName("Кейс: Просмотр списка товаров")
    void getAllProducts_success() throws Exception {
        productRepository.save(new Product("Product 1", "Desc 1", 100.0, 10));
        productRepository.save(new Product("Product 2", "Desc 2", 200.0, 20));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @DisplayName("Кейс: Обновление товара администратором")
    void updateProduct_admin_success() throws Exception {
        Product product = productRepository.save(new Product("Old Name", "Old Desc", 100.0, 10));

        Map<String, Object> update = Map.of(
                "name", "Updated Name",
                "description", "Updated Desc",
                "price", 150.0,
                "quantity", 25
        );

        mockMvc.perform(put("/api/products/" + product.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.price").value(150.0));
    }

    @Test
    @DisplayName("Кейс: Удаление товара администратором")
    void deleteProduct_admin_success() throws Exception {
        Product product = productRepository.save(new Product("To Delete", "Desc", 50.0, 5));

        mockMvc.perform(delete("/api/products/" + product.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
