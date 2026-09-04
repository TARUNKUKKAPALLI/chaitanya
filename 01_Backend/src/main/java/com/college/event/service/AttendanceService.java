package com.college.event.service;

import com.college.event.dto.QrResponseDto;
import com.college.event.exception.BadRequestException;
import com.college.event.exception.ResourceNotFoundException;
import com.college.event.model.*;
import com.college.event.repository.AttendanceTokenRepository;
import com.college.event.repository.EventRepository;
import com.college.event.repository.RegistrationRepository;
import com.college.event.repository.UserRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
public class AttendanceService {

    private final AttendanceTokenRepository attendanceTokenRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Autowired
    public AttendanceService(AttendanceTokenRepository attendanceTokenRepository,
                             EventRepository eventRepository,
                             RegistrationRepository registrationRepository,
                             UserRepository userRepository,
                             NotificationService notificationService) {
        this.attendanceTokenRepository = attendanceTokenRepository;
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public QrResponseDto generateQrCode(Long eventId, String currentUserEmail) {
        Event event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        User user = userRepository.findByEmail(currentUserEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUserEmail));

        boolean isAdmin = user.getRole() == Role.ADMIN;
        boolean isOrganizer = event.getOrganizer().getId().equals(user.getId());

        if (!isAdmin && !isOrganizer) {
            throw new AccessDeniedException("You are not authorized to generate QR code for this event");
        }

        if (event.getStatus() != EventStatus.APPROVED) {
            throw new BadRequestException("Cannot generate QR code for an unapproved event");
        }

        // Generate secure random UUID token
        String tokenString = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(30); // 30 minutes validity

        AttendanceToken token = new AttendanceToken(tokenString, event, expiresAt);
        attendanceTokenRepository.save(token);

        // Generate QR code via ZXing
        String base64Image = generateQrBase64Image(tokenString, 300, 300);

        return new QrResponseDto(
            tokenString,
            base64Image,
            event.getId(),
            event.getTitle(),
            expiresAt
        );
    }

    @Transactional
    public void submitAttendance(String tokenString, String studentEmail) {
        if (tokenString == null || tokenString.trim().isEmpty()) {
            throw new BadRequestException("Token is required");
        }

        AttendanceToken token = attendanceTokenRepository.findByToken(tokenString.trim())
            .orElseThrow(() -> new BadRequestException("Invalid QR code"));

        if (token.isExpired()) {
            throw new BadRequestException("QR code has expired");
        }

        User student = userRepository.findByEmail(studentEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentEmail));

        Event event = token.getEvent();

        Registration registration = registrationRepository.findByEventIdAndStudentId(event.getId(), student.getId())
            .orElseThrow(() -> new BadRequestException("You are not registered for this event"));

        if (Boolean.TRUE.equals(registration.getAttended())) {
            throw new BadRequestException("Attendance has already been marked for this event");
        }

        registration.setAttended(true);
        registrationRepository.save(registration);

        notificationService.createNotification(
            student,
            "Success! Your attendance for '" + event.getTitle() + "' has been verified and marked."
        );
    }

    private String generateQrBase64Image(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();

            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code image", e);
        }
    }
}
