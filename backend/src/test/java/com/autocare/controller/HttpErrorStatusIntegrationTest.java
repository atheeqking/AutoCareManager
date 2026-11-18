package com.autocare.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

/**
 * Runs against a real servlet container. MockMvc does not perform the servlet error dispatch, so it
 * cannot catch a 403 being rewritten to 401 on the way to /error — which signs users out of the
 * frontend.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class HttpErrorStatusIntegrationTest {
    @LocalServerPort int port;
    private final HttpClient http = HttpClient.newHttpClient();

    @Test
    void forbiddenAccessReturns403NotUnauthorized() throws Exception {
        String suffix = Long.toString(System.nanoTime()).substring(8);
        String owner = token(register("owner" + suffix, "71" + pad(suffix), "Owner Person"));
        String other = token(register("other" + suffix, "72" + pad(suffix), null));

        String customerId = field(send("GET", "/customers/me", owner, null).body(), "customerId");
        String vehicleId =
                field(
                        send(
                                        "POST",
                                        "/customers/" + customerId + "/vehicles",
                                        owner,
                                        "{\"make\":\"Honda\",\"model\":\"City\",\"color\":\"Grey\",\"licensePlate\":\"HTTP"
                                                + suffix
                                                + "\"}")
                                .body(),
                        "vehicleId");

        // Another customer's vehicle: forbidden, with a JSON message, not "session expired".
        HttpResponse<String> foreign = send("GET", "/vehicles/" + vehicleId, other, null);
        assertThat(foreign.statusCode()).isEqualTo(403);
        assertThat(foreign.body()).contains("message");

        // URL-rule denial (customer on a guest-only endpoint) goes through sendError → /error.
        assertThat(send("POST", "/appointments/guest", other, "{}").statusCode()).isEqualTo(403);
        assertThat(send("GET", "/dashboard/workshop", other, null).statusCode()).isEqualTo(403);

        // Missing or invalid token is still 401.
        assertThat(send("GET", "/vehicles/" + vehicleId, null, null).statusCode()).isEqualTo(401);
        assertThat(send("GET", "/vehicles/" + vehicleId, "Bearer not-a-token", null).statusCode())
                .isEqualTo(401);
    }

    @Test
    void registrationStoresTheCustomersFullName() throws Exception {
        String suffix = Long.toString(System.nanoTime()).substring(8);
        String named = token(register("named" + suffix, "73" + pad(suffix), "  Priya Raman "));
        assertThat(field(send("GET", "/customers/me", named, null).body(), "name"))
                .isEqualTo("Priya Raman");

        String unnamed = token(register("plain" + suffix, "74" + pad(suffix), null));
        assertThat(field(send("GET", "/customers/me", unnamed, null).body(), "name"))
                .isEqualTo("plain" + suffix);
    }

    private String register(String username, String phone, String name) throws Exception {
        String body =
                "{\"username\":\"%s\",\"email\":\"%s@example.test\",\"phone\":\"%s\",\"password\":\"password123\"%s}"
                        .formatted(
                                username,
                                username,
                                phone,
                                name == null ? "" : ",\"name\":\"" + name + "\"");
        HttpResponse<String> response = send("POST", "/auth/register", null, body);
        assertThat(response.statusCode()).isEqualTo(201);
        return response.body();
    }

    private HttpResponse<String> send(String method, String path, String auth, String body)
            throws Exception {
        HttpRequest.Builder request =
                HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/v1" + path))
                        .header("Accept", "application/json")
                        .method(
                                method,
                                body == null
                                        ? HttpRequest.BodyPublishers.noBody()
                                        : HttpRequest.BodyPublishers.ofString(body));
        if (body != null) request.header("Content-Type", "application/json");
        if (auth != null) request.header("Authorization", auth);
        return http.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private static String token(String loginResponse) {
        return "Bearer " + field(loginResponse, "accessToken");
    }

    private static String field(String json, String name) {
        Matcher m = Pattern.compile("\"" + name + "\"\\s*:\\s*\"([^\"]*)\"").matcher(json);
        assertThat(m.find()).as("field %s in %s", name, json).isTrue();
        return m.group(1);
    }

    private static String pad(String digits) {
        return (digits + "00000000").substring(0, 8);
    }
}
