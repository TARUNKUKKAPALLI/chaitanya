package com.college.event.service;

import com.college.event.dto.NotificationDto;
import com.college.event.exception.ResourceNotFoundException;
import com.college.event.model.Notification;
import com.college.event.model.User;
import com.college.event.repository.NotificationRepository;
import com.college.event.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void createNotification(User user, String message) {
        Notification notification = new Notification(user, message);
        notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(n -> new NotificationDto(n.getId(), n.getMessage(), n.getReadStatus(), n.getCreatedAt()))
            .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId, String email) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new AccessDeniedException("You do not own this notification");
        }

        notification.setReadStatus(true);
        notificationRepository.save(notification);
    }
}
