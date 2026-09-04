package com.college.event;

import com.college.event.dto.AuthResponse;
import com.college.event.dto.LoginRequest;
import com.college.event.dto.RegisterRequest;
import com.college.event.exception.BadRequestException;
import com.college.event.exception.ConflictException;
import com.college.event.model.Role;
import com.college.event.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Test
    public void testSuccessfulRegistrationAndLogin() {
        RegisterRequest registerReq = new RegisterRequest(
            "Test Student",
            "student_test@example.com",
            "password123",
            "STUDENT"
        );

        AuthResponse regResponse = authService.register(registerReq);
        assertNotNull(regResponse.getToken());
        assertEquals("student_test@example.com", regResponse.getEmail());
        assertEquals("STUDENT", regResponse.getRole());

        // Login
        LoginRequest loginReq = new LoginRequest("student_test@example.com", "password123");
        AuthResponse loginResponse = authService.login(loginReq);
        assertNotNull(loginResponse.getToken());
        assertEquals("student_test@example.com", loginResponse.getEmail());
    }

    @Test
    public void testDuplicateEmailRegistration() {
        RegisterRequest registerReq1 = new RegisterRequest(
            "User One",
            "duplicate@example.com",
            "password123",
            "STUDENT"
        );
        authService.register(registerReq1);

        RegisterRequest registerReq2 = new RegisterRequest(
            "User Two",
            "duplicate@example.com",
            "password123",
            "STUDENT"
        );
        assertThrows(ConflictException.class, () -> authService.register(registerReq2));
    }

    @Test
    public void testAdminRegistrationRejection() {
        RegisterRequest registerReq = new RegisterRequest(
            "Fake Admin",
            "fakeadmin@example.com",
            "password123",
            "ADMIN"
        );
        assertThrows(BadRequestException.class, () -> authService.register(registerReq));
    }
}
