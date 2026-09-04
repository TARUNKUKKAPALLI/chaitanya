package com.college.event.controller;

import com.college.event.dto.ApiResponse;
import com.college.event.dto.EventRequestDto;
import com.college.event.dto.EventResponseDto;
import com.college.event.dto.EventStatusUpdateDto;
import com.college.event.model.EventStatus;
import com.college.event.service.EventService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    @Autowired
    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<List<EventResponseDto>> getAllEvents(
        @RequestParam(required = false) String category,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false) EventStatus status,
        @RequestParam(required = false) String search,
        Authentication authentication
    ) {
        String currentUserEmail = authentication != null ? authentication.getName() : null;
        List<EventResponseDto> events = eventService.getAllEvents(category, date, status, search, currentUserEmail);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponseDto> getEventById(@PathVariable Long id, Authentication authentication) {
        String currentUserEmail = authentication != null ? authentication.getName() : null;
        EventResponseDto event = eventService.getEventById(id, currentUserEmail);
        return ResponseEntity.ok(event);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<EventResponseDto> createEvent(@Valid @RequestBody EventRequestDto request,
                                                        Authentication authentication) {
        EventResponseDto created = eventService.createEvent(request, authentication.getName());
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<EventResponseDto> updateEvent(@PathVariable Long id,
                                                        @Valid @RequestBody EventRequestDto request,
                                                        Authentication authentication) {
        EventResponseDto updated = eventService.updateEvent(id, request, authentication.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ApiResponse> deleteEvent(@PathVariable Long id, Authentication authentication) {
        eventService.deleteEvent(id, authentication.getName());
        return ResponseEntity.ok(new ApiResponse(true, "Event deleted successfully"));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EventResponseDto> updateEventStatus(@PathVariable Long id,
                                                              @Valid @RequestBody EventStatusUpdateDto request,
                                                              Authentication authentication) {
        EventResponseDto updated = eventService.updateEventStatus(id, request.getStatus(), authentication.getName());
        return ResponseEntity.ok(updated);
    }
}
