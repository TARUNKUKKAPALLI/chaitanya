package com.college.event.controller;

import com.college.event.dto.DashboardAnalyticsDto;
import com.college.event.dto.EventAnalyticsDto;
import com.college.event.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Autowired
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardAnalyticsDto> getDashboardAnalytics() {
        DashboardAnalyticsDto analytics = analyticsService.getDashboardAnalytics();
        return ResponseEntity.ok(analytics);
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<EventAnalyticsDto> getEventAnalytics(@PathVariable Long eventId) {
        EventAnalyticsDto analytics = analyticsService.getEventAnalytics(eventId);
        return ResponseEntity.ok(analytics);
    }
}
