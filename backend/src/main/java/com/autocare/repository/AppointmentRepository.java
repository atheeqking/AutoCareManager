package com.autocare.repository;
import com.autocare.entity.Appointment; import com.autocare.enums.AppointmentStatus; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface AppointmentRepository extends JpaRepository<Appointment, Long> { Optional<Appointment> findByAppointmentId(String appointmentId); List<Appointment> findByCustomer_CustomerId(String customerId); List<Appointment> findByStatus(AppointmentStatus status); }
