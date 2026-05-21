package org.example.shop.service;

import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("test")
@Primary
public class TestEmailService extends EmailService {

    public TestEmailService() {
        super(null);
    }

    @Override
    public void sendVerificationCode(String to, String code) {
    }
}
