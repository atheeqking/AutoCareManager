package com.autocare.exception;

import com.autocare.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, String>> validation(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(java.util.stream.Collectors.joining(" "));
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }
    @ExceptionHandler(AuthService.InvalidCredentialsException.class)
    ResponseEntity<Map<String, String>> invalidCredentials() { return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid username or password.")); }
    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<Map<String, String>> notFound(ResourceNotFoundException ex) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage())); }
    @ExceptionHandler(DuplicateResourceException.class)
    ResponseEntity<Map<String, String>> conflict(DuplicateResourceException ex) { return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage())); }
    @ExceptionHandler(IllegalStateException.class)
    ResponseEntity<Map<String, String>> badRequest(IllegalStateException ex) { return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage())); }
}
