package com.autocare.entity;

import com.autocare.enums.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity @Table(name = "appointments", indexes = {@Index(name = "idx_appointments_appointment_id", columnList = "appointment_id"), @Index(name = "idx_appointments_status", columnList = "status")})
public class Appointment extends AuditableEntity {
    @Column(name = "appointment_id", nullable = false, unique = true, length = 20) private String appointmentId;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "customer_id", nullable = false) private Customer customer;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "vehicle_id", nullable = false) private Vehicle vehicle;
    @Column(name = "requested_date", nullable = false) private LocalDate requestedDate;
    @Column(name = "requested_time", nullable = false) private LocalTime requestedTime;
    @Enumerated(EnumType.STRING) @Column(name = "service_type", nullable = false, length = 30) private ServiceType serviceType;
    @Column(name = "issue_description", columnDefinition = "text") private String issueDescription;
    @Enumerated(EnumType.STRING) @Column(length = 10) private Priority priority;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private AppointmentStatus status;
    protected Appointment() { }
}
