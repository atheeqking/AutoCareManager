package com.autocare.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

/** Phase 3 access-control probes; these are not business APIs. */
@RestController @RequestMapping("/api/v1/access")
public class AccessProbeController {
    @GetMapping("/customer") public ResponseEntity<Map<String, String>> customer() { return ResponseEntity.ok(Map.of("access", "customer")); }
    @GetMapping("/workshop/employee") public ResponseEntity<Map<String, String>> employee() { return ResponseEntity.ok(Map.of("access", "employee")); }
    @GetMapping("/workshop/manager") public ResponseEntity<Map<String, String>> manager() { return ResponseEntity.ok(Map.of("access", "manager")); }
    @GetMapping("/workshop/owner") public ResponseEntity<Map<String, String>> owner() { return ResponseEntity.ok(Map.of("access", "owner")); }
}
