package com.college.event.controller;

import com.college.event.dto.ApiResponse;
import com.college.event.dto.RegistrationDto;
import com.college.event.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationService registrationService;

    @Autowired
    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/event/{eventId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<RegistrationDto> registerForEvent(@PathVariable Long eventId, Authentication authentication) {
        RegistrationDto registration = registrationService.registerStudentForEvent(eventId, authentication.getName());
        return new ResponseEntity<>(registration, HttpStatus.CREATED);
    }

    @DeleteMapping("/event/{eventId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse> cancelRegistration(@PathVariable Long eventId, Authentication authentication) {
        registrationService.cancelRegistration(eventId, authentication.getName());
        return ResponseEntity.ok(new ApiResponse(true, "Registration cancelled successfully"));
    }

    @GetMapping("/my-events")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<RegistrationDto>> getMyEvents(Authentication authentication) {
        List<RegistrationDto> registrations = registrationService.getMyRegistrations(authentication.getName());
        return ResponseEntity.ok(registrations);
    }

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<List<RegistrationDto>> getEventParticipants(@PathVariable Long eventId, Authentication authentication) {
        List<RegistrationDto> participants = registrationService.getEventRegistrations(eventId, authentication.getName());
        return ResponseEntity.ok(participants);
    }

    @PutMapping("/{registrationId}/attendance")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<RegistrationDto> updateAttendanceManual(
        @PathVariable Long registrationId,
        @RequestBody Map<String, Boolean> payload,
        Authentication authentication
    ) {
        boolean attended = payload.getOrDefault("attended", true);
        RegistrationDto updated = registrationService.updateAttendanceManual(registrationId, attended, authentication.getName());
        return ResponseEntity.ok(updated);
    }
}
