package com.autocare.service;

import com.autocare.dto.response.NotificationResponse;
import com.autocare.entity.Customer;
import com.autocare.entity.Notification;
import com.autocare.entity.ServiceCase;
import com.autocare.entity.Vehicle;
import com.autocare.enums.NotificationType;
import com.autocare.exception.ResourceNotFoundException;
import com.autocare.repository.NotificationRepository;
import com.autocare.repository.ServiceCaseRepository;
import com.autocare.security.CurrentUserService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@Transactional
public class NotificationService {
  private final NotificationRepository repository; private final ServiceCaseRepository serviceCases; private final CurrentUserService currentUser;
  public NotificationService(NotificationRepository repository, ServiceCaseRepository serviceCases, CurrentUserService currentUser) { this.repository = repository; this.serviceCases = serviceCases; this.currentUser = currentUser; }
  public void ready(String serviceCaseId) { if (repository.existsByServiceCase_ServiceCaseId(serviceCaseId)) return; ServiceCase serviceCase = serviceCases.findByServiceCaseId(serviceCaseId).orElseThrow(() -> new ResourceNotFoundException("Service case not found")); Vehicle vehicle = serviceCase.getVehicle(); repository.save(new Notification("NOT-" + serviceCaseId, serviceCase.getCustomer(), serviceCase, "Vehicle ready for pickup", "Your " + vehicle.getMake() + " " + vehicle.getModel() + " (" + vehicle.getLicensePlate() + ") is ready for pickup.", NotificationType.READY_FOR_PICKUP)); }
  public List<NotificationResponse> list() { Customer customer = currentUser.requireCurrentCustomer(); return repository.findByCustomer_CustomerIdOrderByCreatedAtDesc(customer.getCustomerId()).stream().map(this::toResponse).toList(); }
  public NotificationResponse read(String notificationId) { Customer customer = currentUser.requireCurrentCustomer(); Notification notification = repository.findByNotificationIdAndCustomer_CustomerId(notificationId, customer.getCustomerId()).orElseThrow(() -> new ResourceNotFoundException("Notification not found")); notification.markRead(); return toResponse(notification); }
  public void readAll() { repository.findByCustomer_CustomerIdOrderByCreatedAtDesc(currentUser.requireCurrentCustomer().getCustomerId()).forEach(Notification::markRead); }
  public long unread() { return list().stream().filter(notification -> !notification.read()).count(); }
  private NotificationResponse toResponse(Notification notification) { return new NotificationResponse(notification.getNotificationId(), notification.getTitle(), notification.getMessage(), notification.isRead(), notification.getCreatedAt()); }
}
