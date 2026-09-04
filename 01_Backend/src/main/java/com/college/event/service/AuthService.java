package com.college.event.service;

import com.college.event.dto.AuthResponse;
import com.college.event.dto.LoginRequest;
import com.college.event.dto.RegisterRequest;
import com.college.event.exception.BadRequestException;
import com.college.event.exception.ConflictException;
import com.college.event.exception.ResourceNotFoundException;
import com.college.event.model.Role;
import com.college.event.model.User;
import com.college.event.repository.UserRepository;
import com.college.event.security.JwtTokenProvider;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final NotificationService notificationService;

    private final JdbcTemplate jdbcTemplate;

    @Value("${app.admin.email:admin440@gmail.com}")
    private String adminEmail;

    @Value("${app.admin.password:1234567}")
    private String adminPassword;

    @Value("${app.admin.name:System Administrator}")
    private String adminName;

    @Autowired
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager,
                       NotificationService notificationService,
                       JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
        this.notificationService = notificationService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void initAdmin() {
        try {
            jdbcTemplate.update("DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE CAST(role AS VARCHAR) = 'CLUB_COORDINATOR')");
            jdbcTemplate.update("DELETE FROM registrations WHERE student_id IN (SELECT id FROM users WHERE CAST(role AS VARCHAR) = 'CLUB_COORDINATOR')");
            jdbcTemplate.update("DELETE FROM events WHERE organizer_id IN (SELECT id FROM users WHERE CAST(role AS VARCHAR) = 'CLUB_COORDINATOR')");
            jdbcTemplate.update("DELETE FROM users WHERE CAST(role AS VARCHAR) = 'CLUB_COORDINATOR'");
            jdbcTemplate.update("DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email = ?)", "admin@college.edu");
            jdbcTemplate.update("DELETE FROM registrations WHERE student_id IN (SELECT id FROM users WHERE email = ?)", "admin@college.edu");
            jdbcTemplate.update("DELETE FROM attendance_tokens WHERE event_id IN (SELECT id FROM events WHERE organizer_id IN (SELECT id FROM users WHERE email = ?))", "admin@college.edu");
            jdbcTemplate.update("DELETE FROM registrations WHERE event_id IN (SELECT id FROM events WHERE organizer_id IN (SELECT id FROM users WHERE email = ?))", "admin@college.edu");
            jdbcTemplate.update("DELETE FROM events WHERE organizer_id IN (SELECT id FROM users WHERE email = ?)", "admin@college.edu");
            jdbcTemplate.update("DELETE FROM users WHERE email = ? AND email <> ?", "admin@college.edu", adminEmail);

            User admin = userRepository.findByEmail(adminEmail).orElse(null);
            if (admin == null) {
                admin = new User(
                    adminName,
                    adminEmail,
                    passwordEncoder.encode(adminPassword),
                    Role.ADMIN
                );
                userRepository.save(admin);
                logger.info("Default admin user initialized with email: {}", adminEmail);
            } else {
                admin.setName(adminName);
                admin.setRole(Role.ADMIN);
                admin.setPassword(passwordEncoder.encode(adminPassword));
                userRepository.save(admin);
                logger.info("Default admin user credentials reset for email: {}", adminEmail);
            }
        } catch (Exception e) {
            logger.error("Error initializing default admin account: {}", e.getMessage());
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered: " + request.getEmail());
        }

        Role role = Role.STUDENT;
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            String roleStr = request.getRole().trim().toUpperCase();
            if ("ADMIN".equals(roleStr)) {
                throw new BadRequestException("Public registration with ADMIN role is not permitted");
            }
            try {
                role = Role.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role specified: " + request.getRole());
            }
        }

        User user = new User(
            request.getName(),
            request.getEmail(),
            passwordEncoder.encode(request.getPassword()),
            role
        );
        User saved = userRepository.save(user);

        // Send welcome notification
        notificationService.createNotification(saved, "Welcome to College Event Portal, " + saved.getName() + "!");

        // Generate JWT
        String token = tokenProvider.generateTokenFromEmail(saved.getEmail(), saved.getRole().name());

        return new AuthResponse(
            token,
            saved.getId(),
            saved.getName(),
            saved.getEmail(),
            saved.getRole().name()
        );
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        String token = tokenProvider.generateToken(authentication, user.getRole().name());

        return new AuthResponse(
            token,
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name()
        );
    }
}
