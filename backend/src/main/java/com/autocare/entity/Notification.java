package com.autocare.entity;

import com.autocare.enums.NotificationType;
import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name = "notifications", indexes = @Index(name = "idx_notifications_notification_id", columnList = "notification_id"))
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "notification_id", nullable = false, unique = true, length = 20) private String notificationId;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "customer_id", nullable = false) private Customer customer;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "service_case_id") private ServiceCase serviceCase;
    @Column(nullable = false, length = 200) private String title;
    @Column(nullable = false, columnDefinition = "text") private String message;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private NotificationType type;
    @Column(name = "is_read", nullable = false) private boolean read = false;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "read_at") private Instant readAt;
    protected Notification() { }
}
