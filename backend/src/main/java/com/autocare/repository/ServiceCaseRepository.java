package com.autocare.repository;

import com.autocare.entity.ServiceCase;
import com.autocare.enums.*;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceCaseRepository extends JpaRepository<ServiceCase, Long> {
    @org.springframework.data.jpa.repository.Lock(
            jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query(
            "select c from ServiceCase c where c.serviceCaseId = :id")
    Optional<ServiceCase> findForUpdate(
            @org.springframework.data.repository.query.Param("id") String id);

    Optional<ServiceCase> findByServiceCaseId(String serviceCaseId);

    Optional<ServiceCase> findByAppointment_AppointmentId(String appointmentId);

    List<ServiceCase> findByVehicle_VehicleId(String vehicleId);

    List<ServiceCase> findByStatus(ServiceCaseStatus status);

    List<ServiceCase> findByPriority(Priority priority);
}
