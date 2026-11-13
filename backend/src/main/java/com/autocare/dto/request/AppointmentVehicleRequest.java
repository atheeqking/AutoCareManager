package com.autocare.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AppointmentVehicleRequest(@NotBlank String vehicleId) {}
