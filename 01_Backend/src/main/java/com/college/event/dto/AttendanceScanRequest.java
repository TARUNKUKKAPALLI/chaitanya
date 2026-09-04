package com.college.event.dto;

import jakarta.validation.constraints.NotBlank;

public class AttendanceScanRequest {

    @NotBlank(message = "Token is required")
    private String token;

    public AttendanceScanRequest() {
    }

    public AttendanceScanRequest(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
