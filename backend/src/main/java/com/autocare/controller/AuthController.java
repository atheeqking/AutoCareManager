package com.autocare.controller;

import com.autocare.dto.request.LoginRequest;
import com.autocare.dto.request.RegistrationRequest;
import com.autocare.dto.response.AuthenticatedUserResponse;
import com.autocare.dto.response.LoginResponse;
import com.autocare.security.CurrentUserService;
import com.autocare.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService auth; private final CurrentUserService currentUsers;
    public AuthController(AuthService auth, CurrentUserService currentUsers) { this.auth = auth; this.currentUsers = currentUsers; }
    @Operation(summary = "Log in a workshop user", responses = {@ApiResponse(responseCode = "200"), @ApiResponse(responseCode = "401", description = "Invalid credentials")})
    @PostMapping("/login") public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) { return ResponseEntity.ok(auth.login(request)); }
    @Operation(summary = "Register a customer account")
    @PostMapping("/register") public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegistrationRequest request) { return ResponseEntity.status(201).body(auth.registerCustomer(request)); }
    @Operation(summary = "Start a limited guest session")
    @PostMapping("/guest") public ResponseEntity<LoginResponse> guest() { return ResponseEntity.ok(auth.guest()); }
    @Operation(summary = "Get the authenticated application identity", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/me") public ResponseEntity<AuthenticatedUserResponse> me() { return ResponseEntity.ok(auth.me(currentUsers.requireCurrentUser())); }
}
