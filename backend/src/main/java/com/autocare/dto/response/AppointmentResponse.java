package com.autocare.dto.response;
import com.autocare.enums.*; import java.time.*;
public record AppointmentResponse(String appointmentId,String customerId,String customerName,String phone,String vehicleId,String vehicle,String licensePlate,LocalDate requestedDate,LocalTime requestedTime,ServiceType serviceType,String issueDescription,Priority priority,AppointmentStatus status) {}
