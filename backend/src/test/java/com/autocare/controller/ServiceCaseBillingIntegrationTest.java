package com.autocare.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.autocare.entity.*;
import com.autocare.enums.*;
import com.autocare.repository.*;
import com.autocare.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.*;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ServiceCaseBillingIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired CustomerRepository customers;
    @Autowired VehicleRepository vehicles;
    @Autowired UserRepository users;
    @Autowired JwtService jwt;
    @Autowired ServiceCaseRepository cases;
    @Autowired ObjectMapper json;

    private String token(User user) {
        return "Bearer "
                + jwt.createToken(
                        user.getId(),
                        user.getUsername(),
                        user.getRole().name(),
                        user.getAuthenticationType().name());
    }

    private String employeeToken() {
        return token(users.findByUsername("employee@autocare.com").orElseThrow());
    }

    private String create(String suffix) throws Exception {
        Customer customer =
                customers.save(
                        new Customer("CUS-BILL-" + suffix, "Billing Customer", "5551234567"));
        vehicles.save(
                new Vehicle(
                        "VEH-BILL-" + suffix,
                        customer,
                        "Toyota",
                        "Camry",
                        "Blue",
                        "BILL-" + suffix));
        String response =
                mvc.perform(
                                post("/api/v1/service-cases/walk-ins")
                                        .header("Authorization", employeeToken())
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(
                                                json.writeValueAsString(
                                                        java.util.Map.of(
                                                                "customerId",
                                                                customer.getCustomerId(),
                                                                "vehicleId",
                                                                "VEH-BILL-" + suffix,
                                                                "serviceType",
                                                                "GENERAL_MAINTENANCE",
                                                                "priority",
                                                                "NORMAL"))))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.status").value("CHECKED_IN"))
                        .andReturn()
                        .getResponse()
                        .getContentAsString();
        return json.readTree(response).get("serviceCaseId").asText();
    }

    @Test
    void employeeCanServiceBillNotifyAndCompleteWithPdf() throws Exception {
        String id = create("FLOW"), base = "/api/v1/service-cases/" + id, auth = employeeToken();
        mvc.perform(get(base).header("Authorization", auth))
                .andExpect(jsonPath("$.startedByUsername").doesNotExist());
        mvc.perform(post(base + "/start-service").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_SERVICE"))
                .andExpect(jsonPath("$.startedByUsername").value("employee@autocare.com"));
        mvc.perform(post(base + "/start-service").header("Authorization", auth))
                .andExpect(status().isBadRequest());
        mvc.perform(post(base + "/ready-for-pickup").header("Authorization", auth))
                .andExpect(status().isBadRequest());
        mvc.perform(
                        post(base + "/payment-pending")
                                .header("Authorization", auth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"currency\":\"INR\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(
                        put(base + "/diagnosis")
                                .header("Authorization", auth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(
                                        json.writeValueAsString(
                                                java.util.Map.of(
                                                        "value",
                                                        "Inspection completed. ".repeat(120)
                                                                + "FINAL DIAGNOSIS DETAIL"))))
                .andExpect(status().isOk());
        mvc.perform(
                        put(base + "/solution")
                                .header("Authorization", auth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"value\":\"Replaced oil and filter.\"}"))
                .andExpect(status().isOk());
        String item =
                mvc.perform(
                                post(base + "/items")
                                        .header("Authorization", auth)
                                        .contentType(MediaType.APPLICATION_JSON)
                                        .content(
                                                "{\"name\":\"Engine oil\",\"quantity\":3,\"unitPrice\":450.25}"))
                        .andExpect(status().isCreated())
                        .andExpect(jsonPath("$.lineTotal").value(1350.75))
                        .andReturn()
                        .getResponse()
                        .getContentAsString();
        long itemId = json.readTree(item).get("id").asLong();
        mvc.perform(
                        post(base + "/items")
                                .header("Authorization", auth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\":\"Labour\",\"quantity\":1,\"unitPrice\":500}"))
                .andExpect(status().isCreated());
        mvc.perform(
                        post(base + "/payment-pending")
                                .header("Authorization", auth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"currency\":\"INR\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.billingTotal").value(1850.75))
                .andExpect(jsonPath("$.billingCurrency").value("INR"))
                .andExpect(jsonPath("$.status").value("PAYMENT_PENDING"));
        mvc.perform(delete(base + "/items/" + itemId).header("Authorization", auth))
                .andExpect(status().isBadRequest());
        mvc.perform(post(base + "/ready-for-pickup").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READY_FOR_PICKUP"));
        mvc.perform(
                        post(base + "/complete")
                                .header("Authorization", auth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"paymentReceived\":false,\"vehicleCollected\":true}"))
                .andExpect(status().isBadRequest());
        mvc.perform(
                        post(base + "/complete")
                                .header("Authorization", auth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"paymentReceived\":true,\"vehicleCollected\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.paidAt").isNotEmpty())
                .andExpect(jsonPath("$.completedAt").isNotEmpty());
        mvc.perform(post(base + "/cancel").header("Authorization", auth))
                .andExpect(status().isBadRequest());
        mvc.perform(
                        put(base + "/solution")
                                .header("Authorization", auth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"value\":\"Changed\"}"))
                .andExpect(status().isBadRequest());
        byte[] pdf =
                mvc.perform(get(base + "/pdf").header("Authorization", auth))
                        .andExpect(status().isOk())
                        .andExpect(content().contentType("application/pdf"))
                        .andReturn()
                        .getResponse()
                        .getContentAsByteArray();
        try (var document = Loader.loadPDF(pdf)) {
            String text = new PDFTextStripper().getText(document);
            assertThat(text.replaceAll("\\s+", " "))
                    .contains(
                            "FINAL DIAGNOSIS DETAIL",
                            "Engine oil",
                            "1350.75",
                            "INR 1850.75",
                            "PAID IN FULL",
                            "COMPLETED",
                            "Replaced oil and filter.");
            for (String label :
                    java.util.List.of(
                            "Check-in: ",
                            "Bill finalized: ",
                            "Payment: PAID IN FULL - ",
                            "Ready for pickup: ",
                            "Completed / vehicle collected: ")) {
                assertThat(text)
                        .containsPattern(
                                java.util.regex.Pattern.quote(label)
                                        + "[0-9]{2}/[0-9]{2}/[0-9]{4} [0-9]{2}:[0-9]{2}(?![:0-9])");
            }
            assertThat(document.getNumberOfPages()).isGreaterThan(1);
            Path output = Path.of("target", "billing-pdf-review");
            Files.createDirectories(output);
            Files.write(output.resolve("completed-service.pdf"), pdf);
            PDFRenderer renderer = new PDFRenderer(document);
            for (int page = 0; page < document.getNumberOfPages(); page++)
                javax.imageio.ImageIO.write(
                        renderer.renderImageWithDPI(page, 110),
                        "PNG",
                        output.resolve("page-" + (page + 1) + ".png").toFile());
        }
    }

    @Test
    void rejectsInvalidPricesPrematureCompletionAndCustomerMutations() throws Exception {
        String id = create("GUARDS"), base = "/api/v1/service-cases/" + id, auth = employeeToken();
        mvc.perform(
                        post(base + "/complete")
                                .header("Authorization", auth)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"paymentReceived\":true,\"vehicleCollected\":true}"))
                .andExpect(status().isBadRequest());
        User customer =
                users.save(
                        new User(
                                "billing-unauthorized",
                                "x",
                                "billing-unauthorized@test.local",
                                UserRole.CUSTOMER,
                                AuthenticationType.LOCAL));
        mvc.perform(post(base + "/start-service").header("Authorization", token(customer)))
                .andExpect(status().isForbidden());
        mvc.perform(post(base + "/start-service").header("Authorization", auth))
                .andExpect(status().isOk());
        for (String price : java.util.List.of("-1", "1.001", "null"))
            mvc.perform(
                            post(base + "/items")
                                    .header("Authorization", auth)
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(
                                            "{\"name\":\"Invalid\",\"quantity\":1,\"unitPrice\":"
                                                    + price
                                                    + "}"))
                    .andExpect(status().isBadRequest());
        mvc.perform(get(base + "/items").header("Authorization", auth))
                .andExpect(jsonPath("$.length()").value(0));
    }
}
