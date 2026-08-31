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
    public Appointment(String id, Customer customer, Vehicle vehicle, LocalDate date, LocalTime time, ServiceType type, String issue, Priority priority) { this.appointmentId=id;this.customer=customer;this.vehicle=vehicle;this.requestedDate=date;this.requestedTime=time;this.serviceType=type;this.issueDescription=issue;this.priority=priority;this.status=AppointmentStatus.REQUESTED; }
    public String getAppointmentId(){return appointmentId;} public Customer getCustomer(){return customer;} public Vehicle getVehicle(){return vehicle;} public LocalDate getRequestedDate(){return requestedDate;} public LocalTime getRequestedTime(){return requestedTime;} public ServiceType getServiceType(){return serviceType;} public String getIssueDescription(){return issueDescription;} public Priority getPriority(){return priority;} public AppointmentStatus getStatus(){return status;} public void status(AppointmentStatus value){status=value;}
}
