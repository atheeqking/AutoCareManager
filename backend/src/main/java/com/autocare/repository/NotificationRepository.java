package com.autocare.repository;
import com.autocare.entity.Notification; import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
public interface NotificationRepository extends JpaRepository<Notification, Long> { Optional<Notification> findByNotificationId(String notificationId); }
