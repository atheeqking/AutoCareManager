package com.autocare.repository;
import com.autocare.entity.Appointment; import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
public interface AppointmentRepository extends JpaRepository<Appointment, Long> { Optional<Appointment> findByAppointmentId(String appointmentId); }
