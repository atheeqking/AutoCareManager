package com.autocare.service;

import com.autocare.dto.request.LoginRequest;
import com.autocare.dto.request.RegistrationRequest;
import com.autocare.dto.response.AuthenticatedUserResponse;
import com.autocare.dto.response.LoginResponse;
import com.autocare.entity.User;
import com.autocare.enums.AuthenticationType;
import com.autocare.enums.UserRole;
import com.autocare.exception.DuplicateResourceException;
import com.autocare.repository.UserRepository;
import com.autocare.security.CurrentUser;
import com.autocare.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager; private final UserRepository users; private final JwtService jwt; private final PasswordEncoder passwordEncoder;
    public AuthService(AuthenticationManager authenticationManager, UserRepository users, JwtService jwt, PasswordEncoder passwordEncoder) { this.authenticationManager = authenticationManager; this.users = users; this.jwt = jwt; this.passwordEncoder = passwordEncoder; }
    public LoginResponse login(LoginRequest request) {
        try { authenticationManager.authenticate(UsernamePasswordAuthenticationToken.unauthenticated(request.username(), request.password())); }
        catch (AuthenticationException ex) { throw new InvalidCredentialsException(); }
        User user = users.findByUsername(request.username()).orElseThrow(InvalidCredentialsException::new);
        return responseFor(user);
    }
    public LoginResponse guest() {
        String token = jwt.createToken(null, "guest", "GUEST", AuthenticationType.GUEST.name());
        return new LoginResponse(token, "Bearer", new AuthenticatedUserResponse(null, null, "guest", "GUEST", AuthenticationType.GUEST.name()));
    }
    public LoginResponse registerCustomer(RegistrationRequest request) {
        if (users.findByUsername(request.username()).isPresent()) throw new DuplicateResourceException("Username is already in use.");
        if (users.findByEmailIgnoreCase(request.email()).isPresent()) throw new DuplicateResourceException("Email address is already in use.");
        User user = users.save(new User(request.username(), passwordEncoder.encode(request.password()), request.email(), UserRole.CUSTOMER, AuthenticationType.LOCAL));
        return responseFor(user);
    }
    public LoginResponse responseFor(User user) {
        var response = userResponse(user);
        return new LoginResponse(jwt.createToken(user.getId(), user.getUsername(), user.getRole().name(), user.getAuthenticationType().name()), "Bearer", response);
    }
    public AuthenticatedUserResponse me(CurrentUser current) {
        if (current.isGuest()) return new AuthenticatedUserResponse(null, null, "guest", "GUEST", AuthenticationType.GUEST.name());
        return users.findById(current.id()).map(this::userResponse).orElseThrow(InvalidCredentialsException::new);
    }
    public AuthenticatedUserResponse userResponse(User user) { return new AuthenticatedUserResponse(user.getId(), user.getEmail(), user.getUsername(), user.getRole().name(), user.getAuthenticationType().name()); }
    public static class InvalidCredentialsException extends RuntimeException { }
}
