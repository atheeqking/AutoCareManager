package com.autocare.repository;

import com.autocare.entity.Vehicle;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    Optional<Vehicle> findByVehicleId(String vehicleId);

    Optional<Vehicle> findByLicensePlate(String licensePlate);

    Optional<Vehicle> findByLicensePlateIgnoreCase(String licensePlate);

    List<Vehicle> findByCustomer_CustomerId(String customerId);

    List<Vehicle>
            findByLicensePlateContainingIgnoreCaseOrMakeContainingIgnoreCaseOrModelContainingIgnoreCase(
                    String plate, String make, String model);
}
