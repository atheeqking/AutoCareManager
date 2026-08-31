package com.autocare.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegistrationRequest(
        @NotBlank @Size(min = 3, max = 100) @Pattern(regexp = "[A-Za-z0-9._-]+", message = "Username may contain letters, numbers, dots, underscores, and hyphens only.") String username,
        @NotBlank @Email @Size(max = 254) String email,
        @NotBlank @Size(min = 8, max = 100) String password) {
    @Override public String toString() { return "RegistrationRequest[username=" + username + ", email=" + email + ", password=[REDACTED]]"; }
}
