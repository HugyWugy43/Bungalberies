package org.example.shop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.shop.model.Cart;
import org.example.shop.model.Product;
import org.example.shop.model.User;
import org.example.shop.repository.CartRepository;
import org.example.shop.repository.ProductRepository;
import org.example.shop.repository.UserRepository;
import org.example.shop.service.UserDetailsImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Тесты контроллера корзины.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        cartRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new User("cartuser", passwordEncoder.encode("password123"), "ROLE_USER");
        userRepository.save(testUser);

        testProduct = new Product("Test Product", "Description", 100.0, 50);
        productRepository.save(testProduct);

        UserDetailsImpl userDetails = new UserDetailsImpl(testUser);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Кейс: Добавление товара в корзину")
    void addToCart_success() throws Exception {
        Map<String, Object> request = Map.of(
                "productId", testProduct.getId(),
                "quantity", 2
        );

        mockMvc.perform(post("/api/cart")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(testProduct.getId()))
                .andExpect(jsonPath("$.quantity").value(2));
    }

    @Test
    @DisplayName("Кейс: Изменение количества товара в корзине")
    void updateQuantity_success() throws Exception {
        Cart cartItem = new Cart(testUser, testProduct, 1);
        cartRepository.save(cartItem);

        Map<String, Integer> request = Map.of("quantity", 5);

        mockMvc.perform(put("/api/cart/" + cartItem.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(5));
    }

    @Test
    @DisplayName("Кейс: Удаление товара из корзины")
    void removeFromCart_success() throws Exception {
        Cart cartItem = new Cart(testUser, testProduct, 1);
        cartRepository.save(cartItem);

        mockMvc.perform(delete("/api/cart/" + cartItem.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @DisplayName("Кейс: Просмотр пустой корзины")
    void getCart_empty() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
