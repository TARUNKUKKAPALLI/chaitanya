package com.college.event.controller;

import com.college.event.dto.ApiResponse;
import com.college.event.dto.AttendanceScanRequest;
import com.college.event.dto.QrResponseDto;
import com.college.event.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @Autowired
    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/qr/{eventId}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<QrResponseDto> generateAttendanceQr(@PathVariable Long eventId, Authentication authentication) {
        QrResponseDto qrResponse = attendanceService.generateQrCode(eventId, authentication.getName());
        return ResponseEntity.ok(qrResponse);
    }

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse> scanAttendance(@Valid @RequestBody AttendanceScanRequest request,
                                                      Authentication authentication) {
        attendanceService.submitAttendance(request.getToken(), authentication.getName());
        return ResponseEntity.ok(new ApiResponse(true, "Attendance marked successfully!"));
    }
}
