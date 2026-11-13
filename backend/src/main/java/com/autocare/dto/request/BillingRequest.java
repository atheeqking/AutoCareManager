package com.autocare.dto.request;

import jakarta.validation.constraints.*;

public record BillingRequest(@NotBlank @Pattern(regexp = "[A-Z]{3}") String currency) {}
