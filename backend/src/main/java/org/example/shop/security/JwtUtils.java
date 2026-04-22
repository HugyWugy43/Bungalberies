package org.example.shop.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Утилита для генерации и проверки JWT-токенов.
 * <p>
 * Используется для создания токенов аутентификации и проверки их подлинности.
 */
@Component
public class JwtUtils {

    private final Key key;
    private final long jwtExpirationMs;

    /**
     * Создает объект JwtUtils с секретным ключом и временем жизни токена.
     *
     * @param secret          секретный ключ для подписи токена
     * @param jwtExpirationMs время жизни JWT в миллисекундах
     */
    public JwtUtils(@Value("${app.jwtSecret}") String secret,
                    @Value("${app.jwtExpirationMs}") long jwtExpirationMs) {
        if (secret == null || secret.length() < 32) {
            // Значение секрета должно быть достаточно длинным для корректной подписи токенов.
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.jwtExpirationMs = jwtExpirationMs;
    }

    /**
     * Генерирует JWT-токен для заданного имени пользователя.
     *
     * @param username имя пользователя
     * @return строка JWT
     */
    public String generateJwtToken(String username) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key)
                .compact();
    }

    /**
     * Извлекает имя пользователя из JWT-токена.
     *
     * @param token JWT-токен
     * @return имя пользователя
     */
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * Проверяет корректность JWT-токена.
     *
     * @param authToken JWT-токен
     * @return true, если токен валиден, иначе false
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}