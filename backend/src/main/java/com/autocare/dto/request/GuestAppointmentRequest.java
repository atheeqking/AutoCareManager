package com.autocare.dto.request;

import com.autocare.enums.ServiceType;
import jakarta.validation.constraints.*;
import java.time.*;

public record GuestAppointmentRequest(
        @NotBlank @Pattern(
                        regexp = "[0-9]{10}",
                        message = "Phone number must contain exactly 10 digits.")
                String phone,
        @NotBlank @Size(max = 80) String brand,
        @NotBlank @Size(max = 80) String model,
        @NotBlank @Size(max = 30) String licensePlate,
        @NotNull @FutureOrPresent LocalDate requestedDate,
        @NotNull LocalTime requestedTime,
        @NotNull ServiceType serviceType,
        @Size(max = 5000) String issueDescription) {}
