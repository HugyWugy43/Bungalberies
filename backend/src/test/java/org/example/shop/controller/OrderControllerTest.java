package org.example.shop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.shop.dto.GuestOrderRequest;
import org.example.shop.model.*;
import org.example.shop.repository.*;
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
 * Тесты контроллера заказов.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private StatusRepository statusRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        cartRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();
        statusRepository.deleteAll();

        testUser = new User("orderuser", passwordEncoder.encode("password123"), "ROLE_USER");
        userRepository.save(testUser);

        testProduct = new Product("Test Product", "Description", 100.0, 50);
        productRepository.save(testProduct);

        // Создаём статус только если его нет
        if (statusRepository.count() == 0) {
            statusRepository.save(new Status("Новый"));
        }

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
    @DisplayName("Кейс: Успешное оформление заказа")
    void placeOrder_success() throws Exception {
        List<Map<String, Object>> items = List.of(
                Map.of("product", Map.of("id", testProduct.getId()), "quantity", 2)
        );

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(items)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.totalAmount").value(200.0));
    }

    @Test
    @DisplayName("Кейс: Оформление гостевого заказа")
    void placeGuestOrder_success() throws Exception {
        GuestOrderRequest request = new GuestOrderRequest();
        request.setCustomerName("Guest User");
        request.setCustomerPhone("+79001234567");
        request.setCustomerEmail("guest@test.ru");
        request.setShippingAddress("Test Address");

        GuestOrderRequest.OrderItemDto item = new GuestOrderRequest.OrderItemDto();
        item.setProductId(testProduct.getId());
        item.setQuantity(1);
        request.setItems(List.of(item));

        mockMvc.perform(post("/api/orders/guest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.customerName").value("Guest User"))
                .andExpect(jsonPath("$.guest").value(true));
    }

    @Test
    @DisplayName("Кейс: Просмотр истории заказов")
    void getAllOrders_success() throws Exception {
        Status status = statusRepository.findByName("Новый")
                .orElseGet(() -> statusRepository.save(new Status("Новый")));

        Order order = new Order();
        order.setUser(testUser);
        order.setStatus(status);
        order.setTotalAmount(100.0);
        orderRepository.save(order);

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @DisplayName("Кейс: Отслеживание заказа по email")
    void trackOrders_byEmail_success() throws Exception {
        GuestOrderRequest request = new GuestOrderRequest();
        request.setCustomerName("Guest");
        request.setCustomerPhone("+79001234567");
        request.setCustomerEmail("track@test.ru");
        request.setShippingAddress("Address");

        GuestOrderRequest.OrderItemDto item = new GuestOrderRequest.OrderItemDto();
        item.setProductId(testProduct.getId());
        item.setQuantity(1);
        request.setItems(List.of(item));

        mockMvc.perform(post("/api/orders/guest")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)));

        mockMvc.perform(get("/api/orders/track")
                        .param("email", "track@test.ru"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].customerEmail").value("track@test.ru"));
    }
}
