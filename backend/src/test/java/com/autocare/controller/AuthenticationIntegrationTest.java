package com.autocare.controller;

import com.autocare.entity.User;
import com.autocare.enums.AuthenticationType;
import com.autocare.enums.UserRole;
import com.autocare.repository.UserRepository;
import com.autocare.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest @AutoConfigureMockMvc @ActiveProfiles("test")
class AuthenticationIntegrationTest {
    @Autowired MockMvc mvc; @Autowired UserRepository users; @Autowired PasswordEncoder encoder; @Autowired JwtService jwt;
    private String employeeToken; private String customerToken; private String managerToken; private String ownerToken;
    private static final java.util.concurrent.atomic.AtomicInteger SEQUENCE = new java.util.concurrent.atomic.AtomicInteger();
    @BeforeEach void setUp() throws Exception {
        employeeToken = login(create("test-employee", UserRole.EMPLOYEE)); customerToken = login(create("test-customer", UserRole.CUSTOMER));
        managerToken = login(create("test-manager", UserRole.MANAGER)); ownerToken = login(create("test-owner", UserRole.OWNER));
    }
    @Test void workshopLoginCreatesValidJwtAndMeReturnsIdentity() throws Exception {
        assertThat(jwt.parse(employeeToken).get("role", String.class)).isEqualTo("EMPLOYEE");
        mvc.perform(get("/api/v1/auth/me").header("Authorization", bearer(employeeToken))).andExpect(status().isOk()).andExpect(jsonPath("$.username").value(org.hamcrest.Matchers.startsWith("test-employee-"))).andExpect(jsonPath("$.role").value("EMPLOYEE")).andExpect(jsonPath("$.authenticationType").value("LOCAL"));
    }
    @Test void invalidCredentialsAndMissingOrInvalidTokensAreRejected() throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"username\":\"test-employee\",\"password\":\"wrong\"}")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/auth/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer invalid")).andExpect(status().isUnauthorized());
    }
    @Test void authorizationEnforcesWorkshopHierarchyAndCustomerBoundary() throws Exception {
        mvc.perform(get("/api/v1/access/workshop/employee").header("Authorization", bearer(employeeToken))).andExpect(status().isOk());
        mvc.perform(get("/api/v1/access/workshop/manager").header("Authorization", bearer(employeeToken))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/access/workshop/manager").header("Authorization", bearer(managerToken))).andExpect(status().isOk());
        mvc.perform(get("/api/v1/access/workshop/employee").header("Authorization", bearer(ownerToken))).andExpect(status().isOk());
        mvc.perform(get("/api/v1/access/workshop/owner").header("Authorization", bearer(managerToken))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/access/customer").header("Authorization", bearer(customerToken))).andExpect(status().isOk());
        mvc.perform(get("/api/v1/access/workshop/employee").header("Authorization", bearer(customerToken))).andExpect(status().isForbidden());
    }
    @Test void guestAccessHasNoCustomerOrWorkshopAccess() throws Exception {
        String result = mvc.perform(post("/api/v1/auth/guest")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        String token = result.replaceAll(".*\\\"accessToken\\\":\\\"([^\\\"]+)\\\".*", "$1");
        mvc.perform(get("/api/v1/access/customer").header("Authorization", bearer(token))).andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/access/workshop/employee").header("Authorization", bearer(token))).andExpect(status().isForbidden());
    }
    @Test void customerCanRegisterAndReceiveCustomerJwt() throws Exception {
        String username = "new-customer-" + SEQUENCE.incrementAndGet();
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content("{\"username\":\"" + username + "\",\"email\":\"" + username + "@example.test\",\"password\":\"SafePassword123!\"}"))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.user.username").value(username)).andExpect(jsonPath("$.user.role").value("CUSTOMER"));
    }
    @Test void documentedDemoEmployeePasswordWorks() throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"username\":\"employee@autocare.com\",\"password\":\"password\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.user.role").value("EMPLOYEE"));
    }
    private User create(String username, UserRole role) { String unique = username + "-" + SEQUENCE.incrementAndGet(); User user = users.save(new User(unique, encoder.encode("SafePassword123!"), unique + "@example.test", role, AuthenticationType.LOCAL)); assertThat(user.getPassword()).isNotEqualTo("SafePassword123!"); return user; }
    private String login(User user) throws Exception { String json = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"username\":\"" + user.getUsername() + "\",\"password\":\"SafePassword123!\"}")).andExpect(status().isOk()).andReturn().getResponse().getContentAsString(); return json.replaceAll(".*\\\"accessToken\\\":\\\"([^\\\"]+)\\\".*", "$1"); }
    private String bearer(String token) { return "Bearer " + token; }
}
