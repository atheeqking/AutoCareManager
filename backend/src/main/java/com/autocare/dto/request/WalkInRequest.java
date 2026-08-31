package com.autocare.dto.request;
import com.autocare.enums.*; import jakarta.validation.constraints.*;
public record WalkInRequest(@NotBlank String customerId,@NotBlank String vehicleId,@NotNull ServiceType serviceType,@NotNull Priority priority,@Size(max=5000) String issueDescription,@Size(max=5000) String additionalNotes) {}
