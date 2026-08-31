package com.autocare.service;

import com.autocare.dto.request.CustomerRequest; import com.autocare.dto.response.CustomerResponse; import com.autocare.dto.response.VehicleResponse;
import com.autocare.entity.Customer; import com.autocare.entity.User; import com.autocare.exception.ResourceNotFoundException; import com.autocare.repository.CustomerRepository; import com.autocare.repository.UserRepository; import com.autocare.repository.VehicleRepository; import com.autocare.security.CurrentUser; import com.autocare.security.CurrentUserService;
import jakarta.persistence.EntityManager; import jakarta.transaction.Transactional; import org.springframework.security.access.AccessDeniedException; import org.springframework.stereotype.Service;
import java.util.List;

@Service @Transactional
public class CustomerService {
 private final CustomerRepository customers; private final VehicleRepository vehicles; private final UserRepository users; private final CurrentUserService current; private final EntityManager entityManager;
 public CustomerService(CustomerRepository customers, VehicleRepository vehicles, UserRepository users, CurrentUserService current, EntityManager entityManager) { this.customers=customers; this.vehicles=vehicles; this.users=users; this.current=current; this.entityManager=entityManager; }
 public CustomerResponse create(CustomerRequest request) { CurrentUser actor=current.requireCurrentUser(); if ("GUEST".equals(actor.role())) throw new AccessDeniedException("Guest access cannot create customer records"); Customer customer; if ("CUSTOMER".equals(actor.role())) { if (customers.findByUserId(actor.id()).isPresent()) throw new IllegalStateException("Customer profile already exists"); User user=users.findById(actor.id()).orElseThrow(() -> new ResourceNotFoundException("User not found")); customer=new Customer(nextId("customer_business_id_seq", "CUS"), request.name().trim(), request.phone().trim()); customer.assignUser(user); } else { requireWorkshop(actor); customer=new Customer(nextId("customer_business_id_seq", "CUS"), request.name().trim(), request.phone().trim()); } customer.update(request.name().trim(), request.phone().trim(), blankToNull(request.email())); return toResponse(customers.save(customer)); }
 public CustomerResponse get(String customerId) { Customer customer=find(customerId); assertCanAccess(customer); return toResponse(customer); }
 public CustomerResponse mine() { return toResponse(current.requireCurrentCustomer()); }
 public CustomerResponse update(String customerId, CustomerRequest request) { Customer customer=find(customerId); assertCanAccess(customer); customer.update(request.name().trim(), request.phone().trim(), blankToNull(request.email())); return toResponse(customer); }
 public List<CustomerResponse> search(String search) { CurrentUser actor=current.requireCurrentUser(); requireWorkshop(actor); List<Customer> result=(search==null||search.isBlank())?customers.findAll():customers.findByNameContainingIgnoreCaseOrPhoneContainingIgnoreCaseOrEmailContainingIgnoreCase(search.trim(),search.trim(),search.trim()); return result.stream().map(this::toResponse).toList(); }
 public List<VehicleResponse> vehicles(String customerId) { Customer customer=find(customerId); assertCanAccess(customer); return vehicles.findByCustomer_CustomerId(customerId).stream().map(v -> new VehicleResponse(v.getVehicleId(), customerId,v.getMake(),v.getModel(),v.getYear(),v.getColor(),v.getLicensePlate(),v.getVin(),v.getCurrentMileage(),v.getCreatedAt(),v.getUpdatedAt())).toList(); }
 Customer find(String id) { return customers.findByCustomerId(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found")); }
 void assertCanAccess(Customer customer) { CurrentUser actor=current.requireCurrentUser(); if (isWorkshop(actor)) return; if ("CUSTOMER".equals(actor.role()) && customer.getUser()!=null && customer.getUser().getId().equals(actor.id())) return; throw new AccessDeniedException("You cannot access this customer record"); }
 boolean isWorkshop(CurrentUser actor) { return "EMPLOYEE".equals(actor.role())||"MANAGER".equals(actor.role())||"OWNER".equals(actor.role()); }
 void requireWorkshop(CurrentUser actor) { if (!isWorkshop(actor)) throw new AccessDeniedException("Workshop access is required"); }
 private String nextId(String sequence,String prefix) { Number next=(Number)entityManager.createNativeQuery("select nextval('"+sequence+"')").getSingleResult(); return "%s-%06d".formatted(prefix,next.longValue()); }
 private String blankToNull(String value) { return value==null||value.isBlank()?null:value.trim(); }
 private CustomerResponse toResponse(Customer c) { return new CustomerResponse(c.getCustomerId(),c.getName(),c.getPhone(),c.getEmail(),c.getCreatedAt(),c.getUpdatedAt()); }
}
