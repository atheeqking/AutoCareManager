package com.autocare.repository;

import com.autocare.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
  Optional<Notification> findByNotificationId(String notificationId);
  Optional<Notification> findByNotificationIdAndCustomer_CustomerId(String notificationId, String customerId);
  List<Notification> findByCustomer_CustomerIdOrderByCreatedAtDesc(String customerId);
  boolean existsByServiceCase_ServiceCaseId(String serviceCaseId);
}
