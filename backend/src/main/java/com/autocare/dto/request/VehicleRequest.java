package com.autocare.dto.request;
import jakarta.validation.constraints.*;
public record VehicleRequest(@NotBlank(message="Make is required.") @Size(max=80) String make, @NotBlank(message="Model is required.") @Size(max=80) String model, @Min(value=1886, message="Year is invalid.") @Max(value=2100, message="Year is invalid.") Integer year, @NotBlank(message="Color is required.") @Size(max=50) String color, @NotBlank(message="License plate is required.") @Size(max=30) String licensePlate, @Size(max=50) String vin, @PositiveOrZero(message="Mileage cannot be negative.") Long currentMileage) { }
