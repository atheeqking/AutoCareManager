package com.autocare.dto.response;

public record LoginResponse(String accessToken, String tokenType, AuthenticatedUserResponse user) {
    @Override public String toString() { return "LoginResponse[accessToken=[REDACTED], tokenType=" + tokenType + ", user=" + user + "]"; }
}
