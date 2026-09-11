package com.autocare.dto.response;import java.time.Instant;public record NotificationResponse(String notificationId,String title,String message,boolean read,Instant createdAt){}
