package org.example.shop.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationCode(String to, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("Код подтверждения регистрации");
            message.setText("Ваш код подтверждения: " + code + "\n\nНикому не сообщайте этот код.");
            mailSender.send(message);
            log.info("Verification code sent to {}", to);
        } catch (MailException e) {
            log.warn("Failed to send email to {}, code {}: {}. Check MAIL_USERNAME/MAIL_PASSWORD in .env", to, code, e.getMessage());
        }
    }
}
