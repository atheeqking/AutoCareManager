package com.autocare.controller;
import com.autocare.entity.*; import com.autocare.enums.*; import com.autocare.repository.*; import com.autocare.security.JwtService; import org.junit.jupiter.api.Test; import org.springframework.beans.factory.annotation.Autowired; import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc; import org.springframework.boot.test.context.SpringBootTest; import org.springframework.http.MediaType; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.test.context.ActiveProfiles; import org.springframework.test.web.servlet.MockMvc; import org.springframework.transaction.annotation.Transactional; import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*; import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") @Transactional class AppointmentWorkflowIntegrationTest {
 @Autowired MockMvc mvc; @Autowired UserRepository users; @Autowired CustomerRepository customers; @Autowired VehicleRepository vehicles; @Autowired JwtService jwt; @Autowired PasswordEncoder encoder;
 @Test void customerAppointmentCheckInAndWalkInAreAuthorizedAndAtomic() throws Exception { User customer=users.save(new User("apt-customer","x","apt@test.local",UserRole.CUSTOMER,AuthenticationType.LOCAL));Customer c=new Customer("CUS-APT","Appointment Customer","555");c.assignUser(customer);customers.save(c);Vehicle v=vehicles.save(new Vehicle("VEH-APT",c,"Toyota","Camry","Blue","APT-1"));User employee=users.save(new User("apt-employee",encoder.encode("password"),"employee@test.local",UserRole.EMPLOYEE,AuthenticationType.LOCAL));String customerToken=token(customer), employeeToken=token(employee);String body="{\"vehicleId\":\"VEH-APT\",\"requestedDate\":\"2030-01-01\",\"requestedTime\":\"10:00\",\"serviceType\":\"SPECIFIC_ISSUE\",\"issueDescription\":\"Brake noise\"}";String response=mvc.perform(post("/api/v1/appointments").header("Authorization",customerToken).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("REQUESTED")).andReturn().getResponse().getContentAsString();String id=response.replaceAll(".*\"appointmentId\":\"([^\"]+)\".*","$1");mvc.perform(post("/api/v1/appointments/"+id+"/confirm").header("Authorization",employeeToken)).andExpect(status().isOk());mvc.perform(post("/api/v1/appointments/"+id+"/check-in").header("Authorization",employeeToken)).andExpect(status().isOk()).andExpect(jsonPath("$.visitType").value("APPOINTMENT"));mvc.perform(post("/api/v1/appointments/"+id+"/check-in").header("Authorization",employeeToken)).andExpect(status().isBadRequest());mvc.perform(post("/api/v1/service-cases/walk-ins").header("Authorization",employeeToken).contentType(MediaType.APPLICATION_JSON).content("{\"customerId\":\"CUS-APT\",\"vehicleId\":\"VEH-APT\",\"serviceType\":\"GENERAL_MAINTENANCE\",\"priority\":\"HIGH\"}")).andExpect(status().isCreated()).andExpect(jsonPath("$.visitType").value("WALK_IN")); }

 @Autowired ServiceCaseRepository serviceCases;
 @Test void walkInRequiresIssueAndDoesNotCreatePartialCase() throws Exception {
  Customer customer=customers.save(new Customer("CUS-WALK-VALIDATION","Walk-in Customer","5551234567"));
  vehicles.save(new Vehicle("VEH-WALK-VALIDATION",customer,"Toyota","Camry","Blue","WALK-VALIDATION"));
  User employee=users.save(new User("walk-validation-employee","x","walk-validation@test.local",UserRole.EMPLOYEE,AuthenticationType.LOCAL));
  long before=serviceCases.count();
  for (String type : java.util.List.of("SPECIFIC_ISSUE", "BOTH")) {
   String payload="""
     {"customerId":"CUS-WALK-VALIDATION","vehicleId":"VEH-WALK-VALIDATION","serviceType":"%s","priority":"NORMAL","issueDescription":"   "}
     """.formatted(type);
   mvc.perform(post("/api/v1/service-cases/walk-ins").header("Authorization",token(employee)).contentType(MediaType.APPLICATION_JSON).content(payload))
     .andExpect(status().isBadRequest()).andExpect(jsonPath("$.message").value("Issue description is required for this service type"));
   org.assertj.core.api.Assertions.assertThat(serviceCases.count()).isEqualTo(before);
  }
  mvc.perform(post("/api/v1/service-cases/walk-ins").header("Authorization",token(employee)).contentType(MediaType.APPLICATION_JSON).content("""
    {"customerId":"CUS-WALK-VALIDATION","vehicleId":"VEH-WALK-VALIDATION","serviceType":"SPECIFIC_ISSUE","priority":"NORMAL","issueDescription":"Brake noise"}
    """ )).andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("CHECKED_IN"));
  org.assertj.core.api.Assertions.assertThat(serviceCases.count()).isEqualTo(before+1);
 }
 private String token(User u){return "Bearer "+jwt.createToken(u.getId(),u.getUsername(),u.getRole().name(),u.getAuthenticationType().name());}
}
