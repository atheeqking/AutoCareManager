package com.autocare.dto.response;
import com.autocare.enums.*; import java.time.Instant;
public record ServiceCaseResponse(String serviceCaseId,String customerId,String vehicleId,String appointmentId,VisitType visitType,ServiceType serviceType,Priority priority,ServiceCaseStatus status,Instant checkInTime) {}
