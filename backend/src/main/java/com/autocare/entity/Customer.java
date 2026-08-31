package com.autocare.entity;

import jakarta.persistence.*;

@Entity @Table(name = "customers", indexes = @Index(name = "idx_customers_customer_id", columnList = "customer_id"))
public class Customer extends AuditableEntity {
    @Column(name = "customer_id", nullable = false, unique = true, length = 20) private String customerId;
    @Column(nullable = false, length = 150) private String name;
    @Column(nullable = false, length = 30) private String phone;
    @Column(length = 254) private String email;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", unique = true) private User user;
    protected Customer() { }
    public Customer(String customerId, String name, String phone) { this.customerId = customerId; this.name = name; this.phone = phone; }
    public String getCustomerId() { return customerId; }
    public String getName() { return name; }
    public String getPhone() { return phone; }
    public String getEmail() { return email; }
    public User getUser() { return user; }
    public void update(String name, String phone, String email) { this.name = name; this.phone = phone; this.email = email; }
    public void assignUser(User user) { this.user = user; }
}
