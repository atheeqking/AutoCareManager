package com.autocare.entity;

import jakarta.persistence.*;

@Entity @Table(name = "vehicles", indexes = {@Index(name = "idx_vehicles_vehicle_id", columnList = "vehicle_id"), @Index(name = "idx_vehicles_license_plate", columnList = "license_plate")})
public class Vehicle extends AuditableEntity {
    @Column(name = "vehicle_id", nullable = false, unique = true, length = 20) private String vehicleId;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "customer_id", nullable = false) private Customer customer;
    @Column(nullable = false, length = 80) private String make;
    @Column(nullable = false, length = 80) private String model;
    @Column(name = "model_year") private Integer year;
    @Column(nullable = false, length = 50) private String color;
    @Column(name = "license_plate", nullable = false, unique = true, length = 30) private String licensePlate;
    @Column(length = 50) private String vin;
    @Column(name = "current_mileage") private Long currentMileage;
    protected Vehicle() { }
    public Vehicle(String vehicleId, Customer customer, String make, String model, String color, String licensePlate) { this.vehicleId = vehicleId; this.customer = customer; this.make = make; this.model = model; this.color = color; this.licensePlate = licensePlate; }
    public String getVehicleId() { return vehicleId; }
    public Customer getCustomer() { return customer; }
    public String getMake() { return make; }
    public String getModel() { return model; }
    public Integer getYear() { return year; }
    public String getColor() { return color; }
    public String getLicensePlate() { return licensePlate; }
    public String getVin() { return vin; }
    public Long getCurrentMileage() { return currentMileage; }
    public void update(String make, String model, Integer year, String color, String licensePlate, String vin, Long currentMileage) { this.make = make; this.model = model; this.year = year; this.color = color; this.licensePlate = licensePlate; this.vin = vin; this.currentMileage = currentMileage; }
}
