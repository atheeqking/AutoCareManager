package com.autocare.dto.response;
import java.time.Instant;
public record VehicleResponse(String vehicleId, String customerId, String make, String model, Integer year, String color, String licensePlate, String vin, Long currentMileage, Instant createdAt, Instant updatedAt) { }
