package com.autocare.dto.request;
import jakarta.validation.constraints.Email; import jakarta.validation.constraints.NotBlank; import jakarta.validation.constraints.Size; import jakarta.validation.constraints.Pattern;
public record CustomerRequest(@NotBlank(message="Name is required.") @Size(max=150) String name, @NotBlank(message="Phone is required.") @Pattern(regexp="[0-9]{10}", message="Phone number must contain exactly 10 digits.") String phone, @Email(message="Email must be valid.") @Size(max=254) String email) { }
