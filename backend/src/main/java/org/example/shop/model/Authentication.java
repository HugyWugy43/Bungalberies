package org.example.shop.model;

import jakarta.persistence.*;

/**
 * Сущность аутентификации пользователя.
 */
@Entity
@Table(name = "authentications")
public class Authentication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long id;

    @Column(name = "phone", nullable = false, unique = true)
    private String phone;

    @Column(name = "sms_code")
    private String smsCode;

    public Authentication() {}

    public Authentication(String phone, String smsCode) {
        this.phone = phone;
        this.smsCode = smsCode;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getSmsCode() { return smsCode; }
    public void setSmsCode(String smsCode) { this.smsCode = smsCode; }
}
