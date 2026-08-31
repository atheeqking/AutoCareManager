package com.autocare.dto.request;
import com.autocare.enums.ServiceType; import jakarta.validation.constraints.*; import java.time.*;
public record AppointmentRequest(@NotBlank String vehicleId, @NotNull @FutureOrPresent LocalDate requestedDate, @NotNull LocalTime requestedTime, @NotNull ServiceType serviceType, @Size(max=5000) String issueDescription) {}
