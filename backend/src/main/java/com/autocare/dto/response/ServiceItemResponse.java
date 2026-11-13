package com.autocare.dto.response;

import java.math.BigDecimal;

public record ServiceItemResponse(
        Long id,
        String name,
        String description,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal) {
    public static ServiceItemResponse from(com.autocare.entity.ServiceItem item) {
        return new ServiceItemResponse(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getLineTotal());
    }
}
