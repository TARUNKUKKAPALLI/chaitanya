package com.college.event.dto;

public class DashboardAnalyticsDto {

    private long totalEvents;
    private long approvedEvents;
    private long pendingEvents;
    private long rejectedEvents;
    private long totalRegistrations;
    private long totalAttendance;
    private long totalUsers;
    private long totalVenues;

    public DashboardAnalyticsDto() {
    }

    public DashboardAnalyticsDto(long totalEvents, long approvedEvents, long pendingEvents, long rejectedEvents,
                                 long totalRegistrations, long totalAttendance, long totalUsers, long totalVenues) {
        this.totalEvents = totalEvents;
        this.approvedEvents = approvedEvents;
        this.pendingEvents = pendingEvents;
        this.rejectedEvents = rejectedEvents;
        this.totalRegistrations = totalRegistrations;
        this.totalAttendance = totalAttendance;
        this.totalUsers = totalUsers;
        this.totalVenues = totalVenues;
    }

    public long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public long getApprovedEvents() {
        return approvedEvents;
    }

    public void setApprovedEvents(long approvedEvents) {
        this.approvedEvents = approvedEvents;
    }

    public long getPendingEvents() {
        return pendingEvents;
    }

    public void setPendingEvents(long pendingEvents) {
        this.pendingEvents = pendingEvents;
    }

    public long getRejectedEvents() {
        return rejectedEvents;
    }

    public void setRejectedEvents(long rejectedEvents) {
        this.rejectedEvents = rejectedEvents;
    }

    public long getTotalRegistrations() {
        return totalRegistrations;
    }

    public void setTotalRegistrations(long totalRegistrations) {
        this.totalRegistrations = totalRegistrations;
    }

    public long getTotalAttendance() {
        return totalAttendance;
    }

    public void setTotalAttendance(long totalAttendance) {
        this.totalAttendance = totalAttendance;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalVenues() {
        return totalVenues;
    }

    public void setTotalVenues(long totalVenues) {
        this.totalVenues = totalVenues;
    }
}
