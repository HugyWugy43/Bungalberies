package org.example.shop.controller;

import org.example.shop.model.User;
import org.example.shop.repository.UserRepository;
import org.example.shop.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Контроллер аутентификации и регистрации пользователей.
 * <p>
 * Обеспечивает создание учетной записи и вход в систему с выдачей JWT-токена.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    /**
     * Конструктор контроллера аутентификации.
     *
     * @param userRepo  репозиторий пользователей
     * @param encoder   encoder для хеширования паролей
     * @param jwtUtils  утилита для генерации JWT
     */
    public AuthController(UserRepository userRepo, PasswordEncoder encoder, JwtUtils jwtUtils) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Регистрирует нового пользователя.
     *
     * @param body JSON-данные с username, password и optional role
     * @return сообщение о результате регистрации
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String role = body.getOrDefault("role", "ROLE_USER");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "username and password are required"));
        }

        if (userRepo.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already taken"));
        }

        User user = new User(username, encoder.encode(password), role);
        userRepo.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

    /**
     * Выполняет вход пользователя в систему и возвращает JWT-токен.
     *
     * @param body JSON-данные с username и password
     * @return JWT-токен, имя пользователя и роль
     */
    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "username and password required"));
        }

        User user = userRepo.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        }

        if (!encoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }

        String token = jwtUtils.generateJwtToken(username);
        return ResponseEntity.ok(Map.of(
                "token", token,
                "username", username,
                "role", user.getRole()
        ));
    }
}