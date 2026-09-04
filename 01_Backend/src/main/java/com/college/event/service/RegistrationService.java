package com.college.event.service;

import com.college.event.dto.RegistrationDto;
import com.college.event.exception.BadRequestException;
import com.college.event.exception.ConflictException;
import com.college.event.exception.ResourceNotFoundException;
import com.college.event.model.*;
import com.college.event.repository.EventRepository;
import com.college.event.repository.RegistrationRepository;
import com.college.event.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Autowired
    public RegistrationService(RegistrationRepository registrationRepository,
                               EventRepository eventRepository,
                               UserRepository userRepository,
                               NotificationService notificationService) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public RegistrationDto registerStudentForEvent(Long eventId, String studentEmail) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        User student = userRepository.findByEmail(studentEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + studentEmail));

        // 1. Check event status = APPROVED
        if (event.getStatus() != EventStatus.APPROVED) {
            throw new BadRequestException("Event is not approved");
        }

        // 2. Check duplicate registration
        if (registrationRepository.existsByEventIdAndStudentId(eventId, student.getId())) {
            throw new ConflictException("You are already registered for this event");
        }

        // 3. Check capacity
        long currentRegistrations = registrationRepository.countByEventId(eventId);
        if (currentRegistrations >= event.getCapacity()) {
            throw new BadRequestException("Event is full");
        }

        Registration registration = new Registration(event, student);
        Registration saved = registrationRepository.save(registration);

        notificationService.createNotification(
            student,
            "Registration confirmed for '" + event.getTitle() + "' on " + event.getDate() + " at " + event.getStartTime() + "."
        );

        return mapToDto(saved);
    }

    @Transactional
    public void cancelRegistration(Long eventId, String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + studentEmail));

        Registration registration = registrationRepository.findByEventIdAndStudentId(eventId, student.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found for event id: " + eventId));

        registrationRepository.delete(registration);

        notificationService.createNotification(
            student,
            "Your registration for '" + registration.getEvent().getTitle() + "' has been cancelled."
        );
    }

    @Transactional(readOnly = true)
    public List<RegistrationDto> getMyRegistrations(String studentEmail) {
        User student = userRepository.findByEmail(studentEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + studentEmail));

        return registrationRepository.findByStudentIdOrderByRegistrationDateDesc(student.getId())
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RegistrationDto> getEventRegistrations(Long eventId, String currentUserEmail) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        User user = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isOrganizer = event.getOrganizer().getId().equals(user.getId());

        if (!isAdmin && !isOrganizer) {
            throw new AccessDeniedException("You are not authorized to view participants for this event");
        }

        return registrationRepository.findByEventIdOrderByRegistrationDateDesc(eventId)
            .stream()
            .map(this::mapToDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public RegistrationDto updateAttendanceManual(Long registrationId, boolean attended, String currentUserEmail) {
        Registration registration = registrationRepository.findById(registrationId)
            .orElseThrow(() -> new ResourceNotFoundException("Registration not found with id: " + registrationId));

        User user = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        Event event = registration.getEvent();
        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isOrganizer = event.getOrganizer().getId().equals(user.getId());

        if (!isAdmin && !isOrganizer) {
            throw new AccessDeniedException("You are not authorized to mark attendance for this event");
        }

        registration.setAttended(attended);
        Registration saved = registrationRepository.save(registration);

        if (attended) {
            notificationService.createNotification(
                registration.getStudent(),
                "Your attendance for '" + event.getTitle() + "' has been recorded."
            );
        }

        return mapToDto(saved);
    }

    private RegistrationDto mapToDto(Registration reg) {
        RegistrationDto dto = new RegistrationDto();
        dto.setId(reg.getId());
        dto.setRegistrationDate(reg.getRegistrationDate());
        dto.setAttended(reg.getAttended());

        if (reg.getEvent() != null) {
            dto.setEventId(reg.getEvent().getId());
            dto.setEventTitle(reg.getEvent().getTitle());
            dto.setEventDescription(reg.getEvent().getDescription());
            dto.setEventDate(reg.getEvent().getDate());
            dto.setEventStartTime(reg.getEvent().getStartTime());
            dto.setEventEndTime(reg.getEvent().getEndTime());
            dto.setEventCategory(reg.getEvent().getCategory());
            if (reg.getEvent().getVenue() != null) {
                dto.setEventVenueName(reg.getEvent().getVenue().getName());
                dto.setEventVenueLocation(reg.getEvent().getVenue().getLocation());
            }
        }

        if (reg.getStudent() != null) {
            dto.setStudentId(reg.getStudent().getId());
            dto.setStudentName(reg.getStudent().getName());
            dto.setStudentEmail(reg.getStudent().getEmail());
        }

        return dto;
    }
}
