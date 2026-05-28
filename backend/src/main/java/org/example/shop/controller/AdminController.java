package org.example.shop.controller;

import org.example.shop.security.JwtUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final String adminPassword;
    private final JwtUtils jwtUtils;

    public AdminController(@Value("${app.admin-password:admin123}") String adminPassword, JwtUtils jwtUtils) {
        this.adminPassword = adminPassword;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String password = body.get("password");
        if (password == null || !adminPassword.equals(password)) {
            return ResponseEntity.status(401).body(Map.of("message", "Неверный пароль администратора"));
        }
        String token = jwtUtils.generateJwtToken("admin");
        return ResponseEntity.ok(Map.of("token", token));
    }
}
