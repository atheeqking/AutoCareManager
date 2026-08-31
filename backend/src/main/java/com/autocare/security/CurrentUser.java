package com.autocare.security;

public record CurrentUser(Long id, String username, String role, String authenticationType) {
    public boolean isGuest() { return "GUEST".equals(role); }
}
