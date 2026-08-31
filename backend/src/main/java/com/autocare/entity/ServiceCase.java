package com.autocare.entity;

import com.autocare.enums.*;
import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name = "service_cases", indexes = {@Index(name = "idx_service_cases_service_case_id", columnList = "service_case_id"), @Index(name = "idx_service_cases_status", columnList = "status"), @Index(name = "idx_service_cases_priority", columnList = "priority")})
public class ServiceCase extends AuditableEntity {
    @Column(name = "service_case_id", nullable = false, unique = true, length = 30) private String serviceCaseId;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "customer_id", nullable = false) private Customer customer;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "vehicle_id", nullable = false) private Vehicle vehicle;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "appointment_id", unique = true) private Appointment appointment;
    @Enumerated(EnumType.STRING) @Column(name = "visit_type", nullable = false, length = 20) private VisitType visitType;
    @Enumerated(EnumType.STRING) @Column(name = "service_type", nullable = false, length = 30) private ServiceType serviceType;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 10) private Priority priority;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private ServiceCaseStatus status;
    @Column(name = "check_in_time") private Instant checkInTime;
    @Column(columnDefinition = "text") private String diagnosis;
    @Column(columnDefinition = "text") private String solution;
    @Column(name = "technician_notes", columnDefinition = "text") private String technicianNotes;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "created_by_employee_id") private Employee createdBy;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "assigned_employee_id") private Employee assignedEmployee;
    @Column(name = "ready_for_pickup_at") private Instant readyForPickupAt;
    @Column(name = "delivered_at") private Instant deliveredAt;
    @Column(name = "completed_at") private Instant completedAt;
    protected ServiceCase() { }
    public ServiceCase(String id, Customer customer, Vehicle vehicle, Appointment appointment, VisitType visit, ServiceType type, Priority priority, Employee creator) { serviceCaseId=id;this.customer=customer;this.vehicle=vehicle;this.appointment=appointment;visitType=visit;serviceType=type;this.priority=priority;status=ServiceCaseStatus.CHECKED_IN;checkInTime=Instant.now();createdBy=creator; }
    public String getServiceCaseId(){return serviceCaseId;} public Customer getCustomer(){return customer;} public Vehicle getVehicle(){return vehicle;} public Appointment getAppointment(){return appointment;} public VisitType getVisitType(){return visitType;} public ServiceType getServiceType(){return serviceType;} public Priority getPriority(){return priority;} public ServiceCaseStatus getStatus(){return status;} public Instant getCheckInTime(){return checkInTime;} public String getDiagnosis(){return diagnosis;} public String getSolution(){return solution;} public String getTechnicianNotes(){return technicianNotes;} public Employee getAssignedEmployee(){return assignedEmployee;} public Instant getReadyForPickupAt(){return readyForPickupAt;} public void setStatus(ServiceCaseStatus s){status=s;} public void setPriority(Priority p){priority=p;} public void setAssignedEmployee(Employee e){assignedEmployee=e;} public void setDiagnosis(String v){diagnosis=v;} public void setSolution(String v){solution=v;} public void setTechnicianNotes(String v){technicianNotes=v;} public void ready(){status=ServiceCaseStatus.READY_FOR_PICKUP;readyForPickupAt=Instant.now();}
}
