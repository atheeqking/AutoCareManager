package com.autocare.dto.request; import com.autocare.enums.Priority; import jakarta.validation.constraints.*; public record PriorityRequest(@NotNull Priority priority) {}
