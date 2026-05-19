package org.example.shop.service;

import org.example.shop.model.User;
import org.example.shop.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Сервис загрузки данных пользователя по имени.
 * <p>
 * Используется Spring Security для получения информации о пользователе
 * при выполнении аутентификации.
 */
@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Создает сервис загрузки пользователей.
     *
     * @param userRepository репозиторий пользователей
     */
    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Загружает пользователя по имени.
     *
     * @param username имя пользователя
     * @return объект UserDetailsImpl
     * @throws UsernameNotFoundException если пользователь не найден
     */
    @Override
    public UserDetailsImpl loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return new UserDetailsImpl(user);
    }
}