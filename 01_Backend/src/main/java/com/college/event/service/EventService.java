package com.college.event.service;

import com.college.event.dto.EventRequestDto;
import com.college.event.dto.EventResponseDto;
import com.college.event.dto.VenueDto;
import com.college.event.exception.BadRequestException;
import com.college.event.exception.ConflictException;
import com.college.event.exception.ResourceNotFoundException;
import com.college.event.model.*;
import com.college.event.repository.EventRepository;
import com.college.event.repository.RegistrationRepository;
import com.college.event.repository.UserRepository;
import com.college.event.repository.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final RegistrationRepository registrationRepository;
    private final NotificationService notificationService;

    @Autowired
    public EventService(EventRepository eventRepository,
                        VenueRepository venueRepository,
                        UserRepository userRepository,
                        RegistrationRepository registrationRepository,
                        NotificationService notificationService) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
        this.registrationRepository = registrationRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public EventResponseDto createEvent(EventRequestDto dto, String organizerEmail) {
        validateEventTiming(dto);

        User organizer = userRepository.findByEmail(organizerEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + organizerEmail));

        Venue venue = venueRepository.findById(dto.getVenueId())
            .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + dto.getVenueId()));

        if (Boolean.FALSE.equals(venue.getAvailable())) {
            throw new BadRequestException("Venue is currently not available");
        }

        if (dto.getCapacity() > venue.getCapacity()) {
            throw new BadRequestException("Event capacity (" + dto.getCapacity() + ") cannot exceed venue capacity (" + venue.getCapacity() + ")");
        }

        // Venue overlap conflict check
        checkVenueOverlap(venue.getId(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), null);

        Event event = new Event(
            dto.getTitle(),
            dto.getDescription(),
            dto.getDate(),
            dto.getStartTime(),
            dto.getEndTime(),
            dto.getCategory(),
            organizer,
            dto.getCapacity(),
            EventStatus.PENDING,
            venue
        );

        Event saved = eventRepository.save(event);

        notificationService.createNotification(
            organizer,
            "Your event '" + saved.getTitle() + "' has been submitted and is pending admin approval."
        );

        return mapToResponseDto(saved, organizerEmail);
    }

    @Transactional(readOnly = true)
    public List<EventResponseDto> getAllEvents(String category, LocalDate date, EventStatus status, String search, String currentUserEmail) {
        List<Event> events = eventRepository.findAll();

        return events.stream()
            .filter(e -> category == null || category.trim().isEmpty() || e.getCategory().equalsIgnoreCase(category.trim()))
            .filter(e -> date == null || e.getDate().equals(date))
            .filter(e -> status == null || e.getStatus() == status)
            .filter(e -> {
                if (search == null || search.trim().isEmpty()) return true;
                String q = search.trim().toLowerCase();
                return (e.getTitle() != null && e.getTitle().toLowerCase().contains(q)) ||
                       (e.getDescription() != null && e.getDescription().toLowerCase().contains(q)) ||
                       (e.getCategory() != null && e.getCategory().toLowerCase().contains(q));
            })
            .map(e -> mapToResponseDto(e, currentUserEmail))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventResponseDto getEventById(Long id, String currentUserEmail) {
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return mapToResponseDto(event, currentUserEmail);
    }

    @Transactional
    public EventResponseDto updateEvent(Long id, EventRequestDto dto, String userEmail) {
        validateEventTiming(dto);

        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        // Only organizer or Admin can update
        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isOrganizer = event.getOrganizer().getId().equals(user.getId());

        if (!isAdmin && !isOrganizer) {
            throw new AccessDeniedException("You are not authorized to modify this event");
        }

        Venue venue = venueRepository.findById(dto.getVenueId())
            .orElseThrow(() -> new ResourceNotFoundException("Venue not found with id: " + dto.getVenueId()));

        if (Boolean.FALSE.equals(venue.getAvailable())) {
            throw new BadRequestException("Venue is currently not available");
        }

        if (dto.getCapacity() > venue.getCapacity()) {
            throw new BadRequestException("Event capacity cannot exceed venue capacity (" + venue.getCapacity() + ")");
        }

        // Venue overlap conflict check
        checkVenueOverlap(venue.getId(), dto.getDate(), dto.getStartTime(), dto.getEndTime(), event.getId());

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setDate(dto.getDate());
        event.setStartTime(dto.getStartTime());
        event.setEndTime(dto.getEndTime());
        event.setCategory(dto.getCategory());
        event.setCapacity(dto.getCapacity());
        event.setVenue(venue);

        // If non-admin modifies an approved event, set back to PENDING for re-approval
        if (!isAdmin && event.getStatus() == EventStatus.APPROVED) {
            event.setStatus(EventStatus.PENDING);
            notificationService.createNotification(
                event.getOrganizer(),
                "Your event '" + event.getTitle() + "' was modified and is now pending re-approval."
            );
        }

        Event updated = eventRepository.save(event);
        return mapToResponseDto(updated, userEmail);
    }

    @Transactional
    public void deleteEvent(Long id, String userEmail) {
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isOrganizer = event.getOrganizer().getId().equals(user.getId());

        if (!isAdmin && !isOrganizer) {
            throw new AccessDeniedException("You are not authorized to delete this event");
        }

        eventRepository.delete(event);
    }

    @Transactional
    public EventResponseDto updateEventStatus(Long id, EventStatus status, String adminEmail) {
        Event event = eventRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        event.setStatus(status);
        Event saved = eventRepository.save(event);

        String message;
        if (status == EventStatus.APPROVED) {
            message = "Great news! Your event '" + event.getTitle() + "' has been APPROVED by the administrator.";
        } else if (status == EventStatus.REJECTED) {
            message = "Notice: Your event '" + event.getTitle() + "' has been REJECTED by the administrator.";
        } else {
            message = "Your event '" + event.getTitle() + "' status was changed to " + status;
        }

        notificationService.createNotification(event.getOrganizer(), message);

        return mapToResponseDto(saved, adminEmail);
    }

    private void validateEventTiming(EventRequestDto dto) {
        if (dto.getStartTime() == null || dto.getEndTime() == null) {
            throw new BadRequestException("Start time and end time are required");
        }
        if (!dto.getEndTime().isAfter(dto.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }
    }

    private void checkVenueOverlap(Long venueId, LocalDate date, java.time.LocalTime startTime, java.time.LocalTime endTime, Long currentEventId) {
        List<Event> conflicts = eventRepository.findConflictingEvents(venueId, date, startTime, endTime, currentEventId);
        if (!conflicts.isEmpty()) {
            throw new ConflictException("Venue already booked for this time");
        }
    }

    public EventResponseDto mapToResponseDto(Event event, String currentUserEmail) {
        EventResponseDto dto = new EventResponseDto();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setDate(event.getDate());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setCategory(event.getCategory());
        dto.setCapacity(event.getCapacity());
        dto.setStatus(event.getStatus());
        dto.setCreatedAt(event.getCreatedAt());

        if (event.getOrganizer() != null) {
            dto.setOrganizerId(event.getOrganizer().getId());
            dto.setOrganizerName(event.getOrganizer().getName());
            dto.setOrganizerEmail(event.getOrganizer().getEmail());
        }

        if (event.getVenue() != null) {
            dto.setVenue(new VenueDto(
                event.getVenue().getId(),
                event.getVenue().getName(),
                event.getVenue().getLocation(),
                event.getVenue().getCapacity(),
                event.getVenue().getAvailable()
            ));
        }

        long regCount = registrationRepository.countByEventId(event.getId());
        dto.setRegistrationCount(regCount);
        dto.setRemainingSeats(Math.max(0, event.getCapacity() - (int) regCount));

        if (currentUserEmail != null) {
            Optional<User> userOpt = userRepository.findByEmail(currentUserEmail);
            if (userOpt.isPresent()) {
                Optional<Registration> regOpt = registrationRepository.findByEventIdAndStudentId(event.getId(), userOpt.get().getId());
                dto.setIsUserRegistered(regOpt.isPresent());
                dto.setIsAttended(regOpt.map(Registration::getAttended).orElse(false));
            }
        }

        return dto;
    }
}
