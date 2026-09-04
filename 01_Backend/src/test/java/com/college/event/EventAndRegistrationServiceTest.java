package com.college.event;

import com.college.event.dto.*;
import com.college.event.exception.BadRequestException;
import com.college.event.exception.ConflictException;
import com.college.event.model.EventStatus;
import com.college.event.model.Role;
import com.college.event.model.User;
import com.college.event.model.Venue;
import com.college.event.repository.UserRepository;
import com.college.event.repository.VenueRepository;
import com.college.event.service.AttendanceService;
import com.college.event.service.EventService;
import com.college.event.service.RegistrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
public class EventAndRegistrationServiceTest {

    @Autowired
    private EventService eventService;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Venue venue;
    private User faculty;
    private User student1;
    private User student2;
    private User admin;

    @BeforeEach
    public void setup() {
        venue = venueRepository.save(new Venue("Test Hall A", "Block 1", 2, true));

        faculty = userRepository.save(new User("Prof. Smith", "smith@college.edu", passwordEncoder.encode("pass"), Role.FACULTY));
        student1 = userRepository.save(new User("Alice", "alice@college.edu", passwordEncoder.encode("pass"), Role.STUDENT));
        student2 = userRepository.save(new User("Bob", "bob@college.edu", passwordEncoder.encode("pass"), Role.STUDENT));
        admin = userRepository.save(new User("Admin", "admin_test@college.edu", passwordEncoder.encode("pass"), Role.ADMIN));
    }

    @Test
    public void testEventCreationAndConflictDetection() {
        LocalDate eventDate = LocalDate.now().plusDays(5);
        LocalTime start = LocalTime.of(10, 0);
        LocalTime end = LocalTime.of(12, 0);

        EventRequestDto req1 = new EventRequestDto(
            "AI Symposium", "Discussion on modern AI",
            eventDate, start, end, "Technology", 2, venue.getId()
        );

        EventResponseDto created = eventService.createEvent(req1, faculty.getEmail());
        assertNotNull(created.getId());
        assertEquals(EventStatus.PENDING, created.getStatus());

        // Conflicting time: 11:00 to 13:00 on same date and same venue
        EventRequestDto conflictReq = new EventRequestDto(
            "Robotics Workshop", "Hands-on robotics",
            eventDate, LocalTime.of(11, 0), LocalTime.of(13, 0), "Technology", 2, venue.getId()
        );

        assertThrows(ConflictException.class, () -> eventService.createEvent(conflictReq, faculty.getEmail()));
    }

    @Test
    public void testEventApprovalAndStudentRegistration() {
        LocalDate eventDate = LocalDate.now().plusDays(7);
        EventRequestDto req = new EventRequestDto(
            "Hackathon 2026", "24hr Coding Event",
            eventDate, LocalTime.of(9, 0), LocalTime.of(17, 0), "Competition", 1, venue.getId()
        );
        EventResponseDto event = eventService.createEvent(req, faculty.getEmail());

        // Student tries to register while PENDING -> should fail
        assertThrows(BadRequestException.class, () ->
            registrationService.registerStudentForEvent(event.getId(), student1.getEmail())
        );

        // Admin approves event
        EventResponseDto approved = eventService.updateEventStatus(event.getId(), EventStatus.APPROVED, admin.getEmail());
        assertEquals(EventStatus.APPROVED, approved.getStatus());

        // Student 1 registers -> should succeed
        RegistrationDto reg1 = registrationService.registerStudentForEvent(event.getId(), student1.getEmail());
        assertNotNull(reg1.getId());
        assertFalse(reg1.getAttended());

        // Student 1 tries to register again -> duplicate error
        assertThrows(ConflictException.class, () ->
            registrationService.registerStudentForEvent(event.getId(), student1.getEmail())
        );

        // Student 2 tries to register, but capacity = 1 -> should fail (Event is full)
        assertThrows(BadRequestException.class, () ->
            registrationService.registerStudentForEvent(event.getId(), student2.getEmail())
        );
    }

    @Test
    public void testQrAttendanceVerification() {
        LocalDate eventDate = LocalDate.now().plusDays(2);
        EventRequestDto req = new EventRequestDto(
            "Cloud Computing Seminar", "Seminar on AWS/GCP",
            eventDate, LocalTime.of(14, 0), LocalTime.of(16, 0), "Academics", 2, venue.getId()
        );
        EventResponseDto event = eventService.createEvent(req, faculty.getEmail());
        eventService.updateEventStatus(event.getId(), EventStatus.APPROVED, admin.getEmail());

        registrationService.registerStudentForEvent(event.getId(), student1.getEmail());

        // Faculty generates QR code
        QrResponseDto qr = attendanceService.generateQrCode(event.getId(), faculty.getEmail());
        assertNotNull(qr.getToken());
        assertTrue(qr.getQrCode().startsWith("data:image/png;base64,"));

        // Student scans QR code
        attendanceService.submitAttendance(qr.getToken(), student1.getEmail());

        // Student tries to scan again -> should fail
        assertThrows(BadRequestException.class, () ->
            attendanceService.submitAttendance(qr.getToken(), student1.getEmail())
        );
    }
}
