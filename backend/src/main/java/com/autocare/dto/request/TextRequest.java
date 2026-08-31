package com.autocare.dto.request; import jakarta.validation.constraints.*; public record TextRequest(@NotBlank @Size(max=5000) String value) {}
