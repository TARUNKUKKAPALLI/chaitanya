package com.college.event.service;

import com.college.event.dto.DashboardAnalyticsDto;
import com.college.event.dto.EventAnalyticsDto;
import com.college.event.exception.ResourceNotFoundException;
import com.college.event.model.Event;
import com.college.event.model.EventStatus;
import com.college.event.repository.EventRepository;
import com.college.event.repository.RegistrationRepository;
import com.college.event.repository.UserRepository;
import com.college.event.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final VenueRepository venueRepository;

    @Autowired
    public AnalyticsService(EventRepository eventRepository,
                            RegistrationRepository registrationRepository,
                            UserRepository userRepository,
                            VenueRepository venueRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
    }

    @Transactional(readOnly = true)
    public DashboardAnalyticsDto getDashboardAnalytics() {
        long totalEvents = eventRepository.count();
        long approvedEvents = eventRepository.countByStatus(EventStatus.APPROVED);
        long pendingEvents = eventRepository.countByStatus(EventStatus.PENDING);
        long rejectedEvents = eventRepository.countByStatus(EventStatus.REJECTED);
        long totalRegistrations = registrationRepository.count();
        long totalAttendance = registrationRepository.countByAttendedTrue();
        long totalUsers = userRepository.count();
        long totalVenues = venueRepository.count();

        return new DashboardAnalyticsDto(
            totalEvents,
            approvedEvents,
            pendingEvents,
            rejectedEvents,
            totalRegistrations,
            totalAttendance,
            totalUsers,
            totalVenues
        );
    }

    @Transactional(readOnly = true)
    public EventAnalyticsDto getEventAnalytics(Long eventId) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        int totalCapacity = event.getCapacity();
        long registrationCount = registrationRepository.countByEventId(eventId);
        long attendanceCount = registrationRepository.countByEventIdAndAttendedTrue(eventId);

        double attendancePercentage = 0.0;
        if (registrationCount > 0) {
            attendancePercentage = Math.round(((double) attendanceCount / registrationCount * 100.0) * 10.0) / 10.0;
        }

        int remainingSeats = Math.max(0, totalCapacity - (int) registrationCount);

        return new EventAnalyticsDto(
            event.getId(),
            event.getTitle(),
            totalCapacity,
            registrationCount,
            attendanceCount,
            attendancePercentage,
            remainingSeats
        );
    }
}
