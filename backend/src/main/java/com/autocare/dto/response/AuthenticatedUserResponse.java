package com.autocare.dto.response;

public record AuthenticatedUserResponse(Long id, String email, String username, String role,
                                        String authenticationType) { }
