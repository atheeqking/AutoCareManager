package com.autocare.entity;

import com.autocare.enums.AuthenticationType;
import com.autocare.enums.UserRole;
import jakarta.persistence.*;

@Entity @Table(name = "users", indexes = @Index(name = "idx_users_username", columnList = "username"))
public class User extends AuditableEntity {
    @Column(nullable = false, unique = true, length = 100) private String username;
    @Column(name = "password_hash", length = 255) private String password;
    @Column(unique = true, length = 254) private String email;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private UserRole role;
    @Enumerated(EnumType.STRING) @Column(name = "authentication_type", nullable = false, length = 20) private AuthenticationType authenticationType;
    @Column(nullable = false) private boolean enabled = true;
    protected User() { }
    public User(String username, String password, String email, UserRole role, AuthenticationType authenticationType) {
        this.username = username; this.password = password; this.email = email; this.role = role; this.authenticationType = authenticationType;
    }
    public String getUsername() { return username; }
    public String getPassword() { return password; }
    public String getEmail() { return email; }
    public UserRole getRole() { return role; }
    public AuthenticationType getAuthenticationType() { return authenticationType; }
    public boolean isEnabled() { return enabled; }
}
