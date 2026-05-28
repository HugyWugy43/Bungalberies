package org.example.shop.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.shop.model.User;
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
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthController authController;

    private String testPhone = "+79991234567";
    private String testCode;

    @BeforeEach
    void setUp() throws Exception {
        userRepository.deleteAll();
    }

    private void sendCode(String phone) throws Exception {
        mockMvc.perform(post("/api/auth/send-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("phone", phone))))
                .andExpect(status().isOk());
        @SuppressWarnings("unchecked")
        Map<String, String> codes = (Map<String, String>) ReflectionTestUtils.getField(
                authController, "verificationCodes");
        testCode = codes.get(phone);
    }

    @Test
    @DisplayName("Кейс: Успешная регистрация нового пользователя")
    void signup_success() throws Exception {
        sendCode(testPhone);

        Map<String, String> request = Map.of(
                "username", "newuser",
                "password", "password123",
                "phone", testPhone,
                "code", testCode
        );

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully"));
    }

    @Test
    @DisplayName("Кейс: Регистрация с уже существующим username")
    void signup_duplicate_username() throws Exception {
        sendCode(testPhone);
        User existingUser = new User("existinguser", passwordEncoder.encode("password123"), "ROLE_USER");
        userRepository.save(existingUser);

        Map<String, String> request = Map.of(
                "username", "existinguser",
                "password", "password123",
                "phone", testPhone,
                "code", testCode
        );

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Username already taken"));
    }

    @Test
    @DisplayName("Кейс: Регистрация с пустым username")
    void signup_blank_username() throws Exception {
        Map<String, String> request = Map.of(
                "username", "",
                "password", "password123"
        );

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("username and password are required"));
    }

    @Test
    @DisplayName("Кейс: Успешная авторизация пользователя")
    void signin_success() throws Exception {
        String username = "testuser";
        String password = "password123";

        User user = new User(username, passwordEncoder.encode(password), "ROLE_USER");
        userRepository.save(user);

        Map<String, String> request = Map.of(
                "username", username,
                "password", password
        );

        mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.username").value(username))
                .andExpect(jsonPath("$.role").value("ROLE_USER"));
    }

    @Test
    @DisplayName("Кейс: Авторизация с неверным паролем")
    void signin_invalid_password() throws Exception {
        User user = new User("testuser", passwordEncoder.encode("correctpassword"), "ROLE_USER");
        userRepository.save(user);

        Map<String, String> request = Map.of(
                "username", "testuser",
                "password", "wrongpassword"
        );

        mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }
}
