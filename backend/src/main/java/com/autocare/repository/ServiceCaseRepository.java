package com.autocare.repository;
import com.autocare.entity.ServiceCase; import com.autocare.enums.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.List; import java.util.Optional;
public interface ServiceCaseRepository extends JpaRepository<ServiceCase, Long> { Optional<ServiceCase> findByServiceCaseId(String serviceCaseId); List<ServiceCase> findByVehicle_VehicleId(String vehicleId); List<ServiceCase> findByStatus(ServiceCaseStatus status); List<ServiceCase> findByPriority(Priority priority); }
