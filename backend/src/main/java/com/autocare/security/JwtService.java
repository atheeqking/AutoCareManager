package com.autocare.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationSeconds;

    public JwtService(
            @Value("${app.security.jwt.secret}") String secret,
            @Value("${app.security.jwt.expiration}") long expirationSeconds) {
        if (secret == null || secret.isBlank())
            throw new IllegalStateException(
                    "JWT_SECRET is not set. Provide a secret of at least 32 characters.");
        if (secret.length() < 32)
            throw new IllegalStateException("JWT_SECRET must be at least 32 characters long");
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationSeconds = expirationSeconds;
    }

    public String createToken(
            Long userId, String username, String role, String authenticationType) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId == null ? "guest" : userId.toString())
                .claims(
                        Map.of(
                                "username",
                                username,
                                "role",
                                role,
                                "authenticationType",
                                authenticationType))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(expirationSeconds)))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
