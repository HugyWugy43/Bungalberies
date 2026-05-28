package org.example.shop.controller;

import org.example.shop.model.User;
import org.example.shop.repository.UserRepository;
import org.example.shop.security.JwtUtils;
import org.example.shop.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final EmailService emailService;
    private final Map<String, String> verificationCodes = new ConcurrentHashMap<>();

    public AuthController(UserRepository userRepo, PasswordEncoder encoder, JwtUtils jwtUtils, EmailService emailService) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.emailService = emailService;
    }

    @PostMapping("/send-code")
    public ResponseEntity<?> sendCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        String code = String.format("%06d", ThreadLocalRandom.current().nextInt(100000, 999999));
        verificationCodes.put(email, code);
        boolean sent = emailService.sendVerificationCode(email, code);
        if (sent) {
            return ResponseEntity.ok(Map.of("message", "Code sent to email"));
        } else {
            return ResponseEntity.ok(Map.of(
                    "message", "Code sent to email",
                    "code", code,
                    "devMode", true
            ));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String phone = body.get("phone");
        String email = body.get("email");
        String code = body.get("code");
        String role = body.getOrDefault("role", "ROLE_USER");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "username and password are required"));
        }
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        if (code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Verification code is required"));
        }

        String storedCode = verificationCodes.get(email);
        if (storedCode == null || !storedCode.equals(code)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid verification code"));
        }

        if (userRepo.existsByUsername(username)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already taken"));
        }

        verificationCodes.remove(email);

        User user = new User(username, encoder.encode(password), role);
        user.setPhone(phone);
        user.setEmail(email);
        userRepo.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
    }

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
