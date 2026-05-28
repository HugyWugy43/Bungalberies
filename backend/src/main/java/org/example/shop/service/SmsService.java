package org.example.shop.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    private final String apiKey;

    public SmsService(@Value("${sms.api-key:}") String apiKey) {
        this.apiKey = apiKey;
    }

    public boolean sendCode(String phone, String code) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("SMS_API_KEY not configured, dev mode for {}", phone);
            return false;
        }
        try {
            String body = "api_id=" + apiKey
                    + "&to=" + java.net.URLEncoder.encode(phone, "UTF-8")
                    + "&msg=" + java.net.URLEncoder.encode("Ваш код подтверждения: " + code, "UTF-8")
                    + "&json=1";

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://sms.ru/sms/send"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            log.info("SMS response for {}: {}", phone, response.body());

            if (response.body().contains("\"status\":\"OK\"")) {
                log.info("SMS sent to {}", phone);
                return true;
            }
            log.warn("SMS send failed: {}", response.body());
            return false;
        } catch (Exception e) {
            log.error("SMS error for {}: {}", phone, e.getMessage());
            return false;
        }
    }
}
