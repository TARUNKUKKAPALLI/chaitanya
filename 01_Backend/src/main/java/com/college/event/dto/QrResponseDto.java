package com.college.event.dto;

import java.time.LocalDateTime;

public class QrResponseDto {

    private String token;
    private String qrCode; // Base64 data URL
    private Long eventId;
    private String eventTitle;
    private LocalDateTime expiresAt;

    public QrResponseDto() {
    }

    public QrResponseDto(String token, String qrCode, Long eventId, String eventTitle, LocalDateTime expiresAt) {
        this.token = token;
        this.qrCode = qrCode;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.expiresAt = expiresAt;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getQrCode() {
        return qrCode;
    }

    public void setQrCode(String qrCode) {
        this.qrCode = qrCode;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public void setEventTitle(String eventTitle) {
        this.eventTitle = eventTitle;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}
