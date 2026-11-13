package com.autocare.service;

import com.autocare.dto.request.*;
import com.autocare.dto.response.*;
import com.autocare.entity.*;
import com.autocare.enums.*;
import com.autocare.exception.*;
import com.autocare.repository.*;
import com.autocare.security.*;
import jakarta.transaction.Transactional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.*;

@Service @Transactional
public class ServiceCaseWorkflowService {
 private final ServiceCaseRepository cases;
 private final EmployeeRepository employees;
 private final DiagnosisRepository diagnoses;
 private final ServiceItemRepository items;
 private final CurrentUserService current;
 private final UserRepository users;
 public ServiceCaseWorkflowService(ServiceCaseRepository c, EmployeeRepository e, DiagnosisRepository d, ServiceItemRepository i, CurrentUserService x, UserRepository u) { cases=c; employees=e; diagnoses=d; items=i; current=x; users=u; }
 public List<ServiceCaseDetailResponse> list() {
  CurrentUser u=current.requireCurrentUser(); List<ServiceCase> all=cases.findAll();
  if(workshop(u)) return all.stream().map(this::dto).toList();
  Customer c=current.requireCurrentCustomer();
  return all.stream().filter(x->x.getCustomer().getId().equals(c.getId())).map(this::dto).toList();
 }
 public ServiceCaseDetailResponse get(String id) { ServiceCase c=find(id); access(c); return dto(c); }
 public ServiceCaseDetailResponse priority(String id, PriorityRequest r) { ServiceCase c=work(id); editable(c); c.setPriority(r.priority()); return dto(c); }
 public ServiceCaseDetailResponse assign(String id, AssignmentRequest r) {
  ServiceCase c=work(id); editable(c);
  Employee e=employees.findByEmployeeId(r.employeeId()).orElseThrow(()->new ResourceNotFoundException("Employee not found"));
  if(!e.isActive()) throw new IllegalStateException("Employee is inactive");
  c.setAssignedEmployee(e); return dto(c);
 }
 public ServiceCaseDetailResponse startService(String id) {
  ServiceCase c=work(id);
  if(!Set.of(ServiceCaseStatus.CHECKED_IN, ServiceCaseStatus.ON_HOLD).contains(c.getStatus())) throw new IllegalStateException("This case is no longer waiting for service. Refresh to see its current status.");
  c.startService(users.findById(current.requireCurrentUser().id()).orElseThrow(()->new ResourceNotFoundException("User not found")));
  return dto(c);
 }
 public ServiceCaseDetailResponse startDiagnosis(String id) { return move(id,ServiceCaseStatus.CHECKED_IN,ServiceCaseStatus.DIAGNOSIS); }
 public ServiceCaseDetailResponse saveDiagnosis(String id, TextRequest r) {
  ServiceCase c=work(id);
  if(!Set.of(ServiceCaseStatus.DIAGNOSIS,ServiceCaseStatus.IN_SERVICE).contains(c.getStatus())) throw new IllegalStateException("Diagnosis can only be recorded during diagnosis or service");
  Diagnosis d=diagnoses.findFirstByServiceCase_ServiceCaseIdOrderByDiagnosedAtDesc(id).orElseGet(()->new Diagnosis(c,r.value().trim(),null));
  d.update(r.value().trim(),d.getTechnicianNotes()); diagnoses.save(d); c.setDiagnosis(r.value().trim()); return dto(c);
 }
 public ServiceCaseDetailResponse submitDiagnosis(String id) {
  ServiceCase c=work(id);
  if(c.getStatus()!=ServiceCaseStatus.DIAGNOSIS||blank(c.getDiagnosis())) throw new IllegalStateException("A diagnosis is required");
  c.setStatus(ServiceCaseStatus.WAITING_FOR_APPROVAL); return dto(c);
 }
 public ServiceCaseDetailResponse approve(String id) {
  ServiceCase c=work(id);
  if(c.getStatus()!=ServiceCaseStatus.WAITING_FOR_APPROVAL) throw new IllegalStateException("Case must be waiting for approval");
  c.startService(users.findById(current.requireCurrentUser().id()).orElseThrow(()->new ResourceNotFoundException("User not found"))); return dto(c);
 }
 public ServiceCaseDetailResponse solution(String id, TextRequest r) { ServiceCase c=work(id); inService(c); c.setSolution(r.value().trim()); return dto(c); }
 public ServiceCaseDetailResponse notes(String id, TextRequest r) { ServiceCase c=work(id); editable(c); c.setTechnicianNotes(r.value().trim()); return dto(c); }
 public List<ServiceItemResponse> items(String id) { access(find(id)); return items.findByServiceCase_ServiceCaseId(id).stream().map(ServiceItemResponse::from).toList(); }
 public ServiceItemResponse addItem(String id, ServiceItemRequest r) {
  ServiceCase c=work(id); inService(c);
  ServiceItem i=new ServiceItem(c,r.name().trim(),r.description(),r.quantity()); i.setUnitPrice(r.unitPrice());
  return ServiceItemResponse.from(items.save(i));
 }
 public void deleteItem(String id, Long itemId) {
  ServiceCase c=work(id); inService(c);
  ServiceItem i=items.findByServiceCase_ServiceCaseId(id).stream().filter(x->x.getId().equals(itemId)).findFirst().orElseThrow(()->new ResourceNotFoundException("Service item not found in this case"));
  items.delete(i);
 }
 public ServiceCaseDetailResponse payment(String id, BillingRequest request) {
  ServiceCase c=work(id); inService(c);
  if(blank(c.getDiagnosis())||blank(c.getSolution())) throw new IllegalStateException("Save the diagnosis and work performed before finalizing the bill.");
  List<ServiceItem> bill=items.findByServiceCase_ServiceCaseId(id);
  if(bill.isEmpty()||bill.stream().anyMatch(i->i.getUnitPrice()==null)) throw new IllegalStateException("Add at least one billing item and a unit price for every item.");
  try { Currency.getInstance(request.currency()); } catch(IllegalArgumentException e) { throw new IllegalStateException("Choose a valid billing currency."); }
  BigDecimal total=bill.stream().map(ServiceItem::getLineTotal).reduce(BigDecimal.ZERO,BigDecimal::add).setScale(2);
  if(total.compareTo(new BigDecimal("99999999999999.99"))>0) throw new IllegalStateException("The bill total exceeds the supported maximum.");
  c.bill(total,request.currency()); return dto(c);
 }
 public ServiceCaseDetailResponse ready(String id) {
  ServiceCase c=work(id);
  if(c.getStatus()!=ServiceCaseStatus.PAYMENT_PENDING||c.getBilledAt()==null) throw new IllegalStateException("Finalize the bill before marking the vehicle ready for pickup.");
  c.ready(); return dto(c);
 }
 public ServiceCaseDetailResponse complete(String id, CompletionRequest request) {
  ServiceCase c=work(id);
  if(c.getStatus()!=ServiceCaseStatus.READY_FOR_PICKUP||c.getBilledAt()==null) throw new IllegalStateException("Only a billed vehicle ready for pickup can be completed.");
  if(!Boolean.TRUE.equals(request.paymentReceived())||!Boolean.TRUE.equals(request.vehicleCollected())) throw new IllegalStateException("Confirm full payment and vehicle collection before completing the case.");
  c.complete(); return dto(c);
 }
 public ServiceCaseDetailResponse hold(String id) {
  ServiceCase c=work(id);
  if(!Set.of(ServiceCaseStatus.DIAGNOSIS,ServiceCaseStatus.WAITING_FOR_APPROVAL,ServiceCaseStatus.IN_SERVICE).contains(c.getStatus())) throw new IllegalStateException("Case cannot be put on hold");
  c.setStatus(ServiceCaseStatus.ON_HOLD); return dto(c);
 }
 public ServiceCaseDetailResponse cancel(String id) {
  ServiceCase c=work(id); editable(c); c.setStatus(ServiceCaseStatus.CANCELLED); return dto(c);
 }
 private void editable(ServiceCase c) { if(c.getBilledAt()!=null||Set.of(ServiceCaseStatus.COMPLETED,ServiceCaseStatus.DELIVERED,ServiceCaseStatus.CANCELLED,ServiceCaseStatus.READY_FOR_PICKUP).contains(c.getStatus())) throw new IllegalStateException("This case is finalized and cannot be changed."); }
 private void inService(ServiceCase c) { if(c.getStatus()!=ServiceCaseStatus.IN_SERVICE||c.getBilledAt()!=null) throw new IllegalStateException("Changes are only allowed while the vehicle is in service."); }
 private boolean blank(String s) { return s==null||s.isBlank(); }
 private ServiceCaseDetailResponse move(String id,ServiceCaseStatus from,ServiceCaseStatus to) { ServiceCase c=work(id); if(c.getStatus()!=from) throw new IllegalStateException("Invalid service case transition"); c.setStatus(to); return dto(c); }
 private ServiceCase find(String id) { return cases.findByServiceCaseId(id).orElseThrow(()->new ResourceNotFoundException("Service case not found")); }
 private ServiceCase work(String id) {
  if(!workshop(current.requireCurrentUser())) throw new AccessDeniedException("Workshop access is required");
  return cases.findForUpdate(id).orElseThrow(()->new ResourceNotFoundException("Service case not found"));
 }
 private void access(ServiceCase c) { if(workshop(current.requireCurrentUser())) return; if(!c.getCustomer().getId().equals(current.requireCurrentCustomer().getId())) throw new AccessDeniedException("You cannot access this service case"); }
 private boolean workshop(CurrentUser u) { return Set.of("EMPLOYEE","MANAGER","OWNER").contains(u.role()); }
 private ServiceCaseDetailResponse dto(ServiceCase c) {
  Employee e=c.getAssignedEmployee(); Vehicle v=c.getVehicle();
  return new ServiceCaseDetailResponse(c.getServiceCaseId(),c.getCustomer().getCustomerId(),c.getCustomer().getName(),v.getVehicleId(),v.getMake()+" "+v.getModel(),v.getLicensePlate(),c.getVisitType(),c.getServiceType(),c.getPriority(),c.getStatus(),e==null?null:e.getEmployeeId(),e==null?null:e.getName(),c.getDiagnosis(),c.getSolution(),c.getTechnicianNotes(),c.getCheckInTime(),c.getReadyForPickupAt(),c.getStartedBy()==null?null:c.getStartedBy().getUsername(),c.getBillingTotal(),c.getBillingCurrency(),c.getBilledAt(),c.getPaidAt(),c.getCompletedAt());
 }
}
