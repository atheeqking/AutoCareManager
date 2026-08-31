package com.autocare.dto.request;
import jakarta.validation.constraints.Email; import jakarta.validation.constraints.NotBlank; import jakarta.validation.constraints.Size;
public record CustomerRequest(@NotBlank(message="Name is required.") @Size(max=150) String name, @NotBlank(message="Phone is required.") @Size(max=30) String phone, @Email(message="Email must be valid.") @Size(max=254) String email) { }
