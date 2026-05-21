package org.example.shop;

import org.example.shop.model.*;
import org.example.shop.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ProductRepository productRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", passwordEncoder.encode("adminpass"), "ROLE_ADMIN");
            userRepository.save(admin);
            System.out.println("Admin created: admin / adminpass");
        }

        if (!userRepository.existsByUsername("user")) {
            User user = new User("user", passwordEncoder.encode("userpass"), "ROLE_USER");
            userRepository.save(user);
            System.out.println("Created user/userpass");
        }

        if (productRepository.count() == 0) {
            productRepository.save(new Product("Notebook", "A4 lined notebook", 99.0, 50));
            productRepository.save(new Product("Pen", "Ballpoint pen", 19.0, 200));
            productRepository.save(new Product("Headphones", "Wired headphones", 1299.0, 15));
            System.out.println("Sample products created");
        }
    }
}
