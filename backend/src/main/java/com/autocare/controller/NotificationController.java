package com.autocare.controller;

import com.autocare.dto.response.NotificationResponse;
import com.autocare.service.NotificationService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {
  private final NotificationService notifications;
  public NotificationController(NotificationService notifications) { this.notifications = notifications; }
  @GetMapping public List<NotificationResponse> list() { return notifications.list(); }
  @GetMapping("/unread-count") public Map<String, Long> unread() { return Map.of("count", notifications.unread()); }
  @PatchMapping("/{notificationId}/read") public NotificationResponse read(@PathVariable String notificationId) { return notifications.read(notificationId); }
  @PatchMapping("/read-all") public void readAll() { notifications.readAll(); }
}
