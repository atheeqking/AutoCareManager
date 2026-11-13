package com.autocare.dto.request;
import jakarta.validation.constraints.*;
public record CompletionRequest(
 @NotNull @AssertTrue(message="Confirm that the full payment has been received.") Boolean paymentReceived,
 @NotNull @AssertTrue(message="Confirm that the vehicle has been collected.") Boolean vehicleCollected) {}
