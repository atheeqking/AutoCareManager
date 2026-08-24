package com.autocare.repository;
import com.autocare.entity.Vehicle; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List; import java.util.Optional;
public interface VehicleRepository extends JpaRepository<Vehicle, Long> { Optional<Vehicle> findByVehicleId(String vehicleId); Optional<Vehicle> findByLicensePlate(String licensePlate); List<Vehicle> findByCustomer_CustomerId(String customerId); }
