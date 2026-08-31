package com.autocare.security;

import com.autocare.service.AuthService;
import com.autocare.service.GoogleOAuthUserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class GoogleAuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final GoogleOAuthUserService googleUsers; private final AuthService authService; private final String frontendUrl;
    public GoogleAuthenticationSuccessHandler(GoogleOAuthUserService googleUsers, AuthService authService, @Value("${app.security.frontend-url}") String frontendUrl) { this.googleUsers = googleUsers; this.authService = authService; this.frontendUrl = frontendUrl; }
    @Override public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2User principal = (OAuth2User) authentication.getPrincipal();
        String token = authService.responseFor(googleUsers.findOrCreate(principal)).accessToken();
        response.sendRedirect(frontendUrl + "/auth/callback#accessToken=" + java.net.URLEncoder.encode(token, java.nio.charset.StandardCharsets.UTF_8));
    }
}
