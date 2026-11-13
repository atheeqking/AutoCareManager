package com.autocare.entity;

import jakarta.persistence.*;

@Entity @Table(name = "service_items")
public class ServiceItem extends AuditableEntity {
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "service_case_id", nullable = false) private ServiceCase serviceCase;
    @Column(nullable = false, length = 150) private String name;
    @Column(columnDefinition = "text") private String description;
    @Column(nullable = false) private Integer quantity = 1;
    @Column(name = "unit_price", precision = 12, scale = 2) private java.math.BigDecimal unitPrice;
    public java.math.BigDecimal getUnitPrice() { return unitPrice; }
    public java.math.BigDecimal getLineTotal() { return unitPrice == null ? null : unitPrice.multiply(java.math.BigDecimal.valueOf(quantity)); }
    public void setUnitPrice(java.math.BigDecimal price) { unitPrice = price; }
    protected ServiceItem() { } public ServiceItem(ServiceCase c,String n,String d,Integer q){serviceCase=c;name=n;description=d;quantity=q;} public String getName(){return name;} public String getDescription(){return description;} public Integer getQuantity(){return quantity;} public void update(String n,String d,Integer q){name=n;description=d;quantity=q;}
}
