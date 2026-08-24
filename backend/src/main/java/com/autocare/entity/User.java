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
}
