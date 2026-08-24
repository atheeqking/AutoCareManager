package com.autocare.entity;

import jakarta.persistence.*;

@Entity @Table(name = "service_items")
public class ServiceItem extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "service_case_id", nullable = false) private ServiceCase serviceCase;
    @Column(nullable = false, length = 150) private String name;
    @Column(columnDefinition = "text") private String description;
    @Column(nullable = false) private Integer quantity = 1;
    protected ServiceItem() { }
}
