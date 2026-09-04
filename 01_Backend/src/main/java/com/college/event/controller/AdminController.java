package com.college.event.controller;

import com.college.event.dto.ApiResponse;
import com.college.event.dto.UserResponseDto;
import com.college.event.exception.BadRequestException;
import com.college.event.exception.ResourceNotFoundException;
import com.college.event.model.Role;
import com.college.event.model.User;
import com.college.event.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;

    @Autowired
    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        List<UserResponseDto> users = userRepository.findAll()
            .stream()
            .map(u -> new UserResponseDto(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getCreatedAt()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).count();
            if (adminCount <= 1) {
                throw new BadRequestException("Cannot delete the only remaining administrator");
            }
        }

        userRepository.delete(user);
        return ResponseEntity.ok(new ApiResponse(true, "User deleted successfully"));
    }
}
