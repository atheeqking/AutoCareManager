package com.autocare.dto.response;
import java.time.Instant;
public record CustomerResponse(String customerId, String name, String phone, String email, Instant createdAt, Instant updatedAt) { }
