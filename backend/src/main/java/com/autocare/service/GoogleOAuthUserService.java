package com.autocare.service;

import com.autocare.entity.User;
import com.autocare.enums.AuthenticationType;
import com.autocare.enums.UserRole;
import com.autocare.repository.UserRepository;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class GoogleOAuthUserService {
    private final UserRepository users;
    public GoogleOAuthUserService(UserRepository users) { this.users = users; }
    public User findOrCreate(OAuth2User principal) {
        String email = principal.getAttribute("email");
        if (email == null || email.isBlank()) throw new IllegalArgumentException("Google account did not provide an email address");
        return users.findByEmailIgnoreCase(email).orElseGet(() -> users.save(new User(email.toLowerCase(), null, email.toLowerCase(), UserRole.CUSTOMER, AuthenticationType.GOOGLE)));
    }
}
