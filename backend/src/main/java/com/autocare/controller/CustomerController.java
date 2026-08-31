package com.autocare.controller;
import com.autocare.dto.request.CustomerRequest; import com.autocare.dto.request.VehicleRequest; import com.autocare.dto.response.CustomerResponse; import com.autocare.dto.response.VehicleResponse; import com.autocare.service.CustomerService; import com.autocare.service.VehicleService; import io.swagger.v3.oas.annotations.Operation; import io.swagger.v3.oas.annotations.security.SecurityRequirement; import jakarta.validation.Valid; import org.springframework.http.*; import org.springframework.web.bind.annotation.*; import java.util.List;
@RestController @RequestMapping("/api/v1/customers") @SecurityRequirement(name="bearerAuth")
public class CustomerController {
 private final CustomerService customers; private final VehicleService vehicles; public CustomerController(CustomerService customers, VehicleService vehicles) { this.customers=customers; this.vehicles=vehicles; }
 @Operation(summary="Create a customer (workshop) or create the authenticated customer's profile") @PostMapping public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest request) { return ResponseEntity.status(HttpStatus.CREATED).body(customers.create(request)); }
 @Operation(summary="Search customers (workshop roles only)") @GetMapping public List<CustomerResponse> search(@RequestParam(required=false) String search) { return customers.search(search); }
 @GetMapping("/me") public CustomerResponse me() { return customers.mine(); }
 @Operation(summary="Get a customer; customers may only retrieve themselves") @GetMapping("/{customerId}") public CustomerResponse get(@PathVariable String customerId) { return customers.get(customerId); }
 @PutMapping("/{customerId}") public CustomerResponse update(@PathVariable String customerId,@Valid @RequestBody CustomerRequest request) { return customers.update(customerId,request); }
 @GetMapping("/{customerId}/vehicles") public List<VehicleResponse> vehicles(@PathVariable String customerId) { return customers.vehicles(customerId); }
 @PostMapping("/{customerId}/vehicles") public ResponseEntity<VehicleResponse> createVehicle(@PathVariable String customerId,@Valid @RequestBody VehicleRequest request) { return ResponseEntity.status(HttpStatus.CREATED).body(vehicles.create(customerId,request)); }
}
