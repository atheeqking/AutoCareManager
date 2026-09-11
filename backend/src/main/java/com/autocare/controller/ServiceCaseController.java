package com.autocare.controller;
import com.autocare.dto.request.*;
import com.autocare.dto.response.*;
import com.autocare.service.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/api/v1/service-cases")
public class ServiceCaseController {
 private final AppointmentService appointments; private final ServiceCaseWorkflowService workflow; private final HistoryPdfService documents; private final NotificationService notifications;
 public ServiceCaseController(AppointmentService a,ServiceCaseWorkflowService w,HistoryPdfService d,NotificationService n){appointments=a;workflow=w;documents=d;notifications=n;}
 @PostMapping("/walk-ins") public ResponseEntity<ServiceCaseResponse> walkIn(@Valid @RequestBody WalkInRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(appointments.walkIn(r));}
 @GetMapping public List<ServiceCaseDetailResponse> list(){return workflow.list();}
 @GetMapping("/{id}") public ServiceCaseDetailResponse get(@PathVariable String id){return workflow.get(id);}
 @PutMapping("/{id}/priority") public ServiceCaseDetailResponse priority(@PathVariable String id,@Valid @RequestBody PriorityRequest r){return workflow.priority(id,r);}
 @PutMapping("/{id}/assignment") public ServiceCaseDetailResponse assignment(@PathVariable String id,@Valid @RequestBody AssignmentRequest r){return workflow.assign(id,r);}
 @PostMapping("/{id}/start-diagnosis") public ServiceCaseDetailResponse startDiagnosis(@PathVariable String id){return workflow.startDiagnosis(id);}
 @PutMapping("/{id}/diagnosis") public ServiceCaseDetailResponse diagnosis(@PathVariable String id,@Valid @RequestBody TextRequest r){return workflow.saveDiagnosis(id,r);}
 @PostMapping("/{id}/submit-diagnosis") public ServiceCaseDetailResponse submitDiagnosis(@PathVariable String id){return workflow.submitDiagnosis(id);}
 @PostMapping("/{id}/approve") public ServiceCaseDetailResponse approve(@PathVariable String id){return workflow.approve(id);}
 @PutMapping("/{id}/solution") public ServiceCaseDetailResponse solution(@PathVariable String id,@Valid @RequestBody TextRequest r){return workflow.solution(id,r);}
 @PutMapping("/{id}/notes") public ServiceCaseDetailResponse notes(@PathVariable String id,@Valid @RequestBody TextRequest r){return workflow.notes(id,r);}
 @GetMapping("/{id}/items") public List<ServiceItemResponse> items(@PathVariable String id){return workflow.items(id);}
 @PostMapping("/{id}/items") public ResponseEntity<ServiceItemResponse> addItem(@PathVariable String id,@Valid @RequestBody ServiceItemRequest r){return ResponseEntity.status(HttpStatus.CREATED).body(workflow.addItem(id,r));}
 @DeleteMapping("/{id}/items/{itemId}") public ResponseEntity<Void> deleteItem(@PathVariable String id,@PathVariable Long itemId){workflow.deleteItem(id,itemId);return ResponseEntity.noContent().build();}
 @PostMapping("/{id}/payment-pending") public ServiceCaseDetailResponse payment(@PathVariable String id){return workflow.payment(id);}
 @PostMapping("/{id}/hold") public ServiceCaseDetailResponse hold(@PathVariable String id){return workflow.hold(id);}
 @PostMapping("/{id}/cancel") public ServiceCaseDetailResponse cancel(@PathVariable String id){return workflow.cancel(id);}
 @PostMapping("/{id}/ready-for-pickup") @Transactional public ServiceCaseDetailResponse ready(@PathVariable String id){ServiceCaseDetailResponse result=workflow.ready(id);notifications.ready(id);return result;}
 @GetMapping(value="/{id}/pdf",produces="application/pdf") public ResponseEntity<byte[]> pdf(@PathVariable String id)throws java.io.IOException{return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\""+id+".pdf\"").body(documents.pdf(id));}
}
