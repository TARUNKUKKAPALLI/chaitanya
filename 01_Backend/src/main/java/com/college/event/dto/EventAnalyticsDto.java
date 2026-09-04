package com.college.event.dto;

public class EventAnalyticsDto {

    private Long eventId;
    private String eventTitle;
    private Integer totalCapacity;
    private Long registrationCount;
    private Long attendanceCount;
    private Double attendancePercentage;
    private Integer remainingSeats;

    public EventAnalyticsDto() {
    }

    public EventAnalyticsDto(Long eventId, String eventTitle, Integer totalCapacity, Long registrationCount,
                             Long attendanceCount, Double attendancePercentage, Integer remainingSeats) {
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.totalCapacity = totalCapacity;
        this.registrationCount = registrationCount;
        this.attendanceCount = attendanceCount;
        this.attendancePercentage = attendancePercentage;
        this.remainingSeats = remainingSeats;
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

    public Integer getTotalCapacity() {
        return totalCapacity;
    }

    public void setTotalCapacity(Integer totalCapacity) {
        this.totalCapacity = totalCapacity;
    }

    public Long getRegistrationCount() {
        return registrationCount;
    }

    public void setRegistrationCount(Long registrationCount) {
        this.registrationCount = registrationCount;
    }

    public Long getAttendanceCount() {
        return attendanceCount;
    }

    public void setAttendanceCount(Long attendanceCount) {
        this.attendanceCount = attendanceCount;
    }

    public Double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(Double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public Integer getRemainingSeats() {
        return remainingSeats;
    }

    public void setRemainingSeats(Integer remainingSeats) {
        this.remainingSeats = remainingSeats;
    }
}
