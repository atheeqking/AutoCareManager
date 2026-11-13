package com.autocare.controller;

import com.autocare.entity.*;
import com.autocare.enums.*;
import com.autocare.repository.*;
import com.autocare.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test") @Transactional
class GuestAppointmentIntegrationTest {
 @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired UserRepository users;
 @Autowired CustomerRepository customers; @Autowired VehicleRepository vehicles; @Autowired AppointmentRepository appointments; @Autowired JwtService jwt;
 private String guest() throws Exception { return "Bearer "+json.readTree(mvc.perform(post("/api/v1/auth/guest")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString()).get("accessToken").asText(); }
 private String token(User u) { return "Bearer "+jwt.createToken(u.getId(),u.getUsername(),u.getRole().name(),u.getAuthenticationType().name()); }
 private String payload(String phone) { return """
  {"phone":"%s","brand":"Toyota","model":"Camry","licensePlate":"guest-test","requestedDate":"2030-05-20","requestedTime":"10:30","serviceType":"GENERAL_MAINTENANCE"}
  """.formatted(phone); }
 @Test void guestBookingCreatesVehicleAndCanBeCheckedInByWorkshop() throws Exception {
  User owner=users.save(new User("guest-test-owner","x","guest-owner@example.test",UserRole.CUSTOMER,AuthenticationType.LOCAL));
  Customer existing=new Customer("CUS-GUEST-EXISTING","Existing private customer","5551234567"); existing.assignUser(owner); customers.save(existing);
  long userCount=users.count(),vehicleCount=vehicles.count(); String guest=guest();
  String response=mvc.perform(post("/api/v1/appointments/guest").header("Authorization",guest).contentType(APPLICATION_JSON).content(payload("5551234567")))
   .andExpect(status().isCreated()).andExpect(jsonPath("$.status").value("REQUESTED")).andExpect(jsonPath("$.guestBooking").value(true)).andExpect(jsonPath("$.phone").value("5551234567")).andExpect(jsonPath("$.vehicleId").isNotEmpty()).andExpect(jsonPath("$.vehicle").value("Toyota Camry")).andExpect(jsonPath("$.licensePlate").value("GUEST-TEST")).andReturn().getResponse().getContentAsString();
  var booking=json.readTree(response);String id=booking.get("appointmentId").asText(),customerId=booking.get("customerId").asText();
  assertThat(customerId).isNotEqualTo(existing.getCustomerId());
  assertThat(customers.findByCustomerId(customerId).orElseThrow().getUser()).isNull();
  assertThat(users.count()).isEqualTo(userCount);assertThat(vehicles.count()).isEqualTo(vehicleCount+1);
  assertThat(vehicles.findByVehicleId(booking.get("vehicleId").asText()).orElseThrow().getCustomer().getCustomerId()).isEqualTo(customerId);
  String base="/api/v1/appointments/"+id;
  mvc.perform(get(base).header("Authorization",guest)).andExpect(status().isForbidden());
  mvc.perform(get("/api/v1/appointments").header("Authorization",guest)).andExpect(status().isForbidden());
  mvc.perform(get(base).header("Authorization",token(owner))).andExpect(status().isForbidden());
  mvc.perform(post(base+"/confirm").header("Authorization",guest)).andExpect(status().isForbidden());
  String employee=token(users.findByUsername("employee@autocare.com").orElseThrow());
  mvc.perform(get("/api/v1/appointments").header("Authorization",employee)).andExpect(status().isOk());
  mvc.perform(post(base+"/confirm").header("Authorization",employee)).andExpect(status().isOk());
  mvc.perform(post(base+"/check-in").header("Authorization",employee)).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("CHECKED_IN"));
 }
 @Test void invalidGuestRequestsDoNotCreateProfilesOrAppointments() throws Exception {
  String guest=guest(); long customerCount=customers.count(),appointmentCount=appointments.count();
  for(String phone:java.util.List.of("55512345678","555123456","555abc4567","")) mvc.perform(post("/api/v1/appointments/guest").header("Authorization",guest).contentType(APPLICATION_JSON).content(payload(phone))).andExpect(status().isBadRequest());
  mvc.perform(post("/api/v1/appointments/guest").header("Authorization",guest).contentType(APPLICATION_JSON).content(payload("5551234567").replace("2030-05-20","2020-01-01"))).andExpect(status().isBadRequest());
  mvc.perform(post("/api/v1/appointments/guest").header("Authorization",guest).contentType(APPLICATION_JSON).content(payload("5551234567").replace("GENERAL_MAINTENANCE","SPECIFIC_ISSUE"))).andExpect(status().isBadRequest());
  mvc.perform(post("/api/v1/appointments/guest").contentType(APPLICATION_JSON).content(payload("5551234567"))).andExpect(status().isUnauthorized());
  mvc.perform(post("/api/v1/appointments/guest").header("Authorization",guest).contentType(APPLICATION_JSON).content(payload("5551234567").replace("Toyota", " "))).andExpect(status().isBadRequest());
  assertThat(customers.count()).isEqualTo(customerCount);assertThat(appointments.count()).isEqualTo(appointmentCount);
 }
}
