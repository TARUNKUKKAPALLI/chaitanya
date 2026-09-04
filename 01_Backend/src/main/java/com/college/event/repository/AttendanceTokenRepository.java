package com.college.event.repository;

import com.college.event.model.AttendanceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttendanceTokenRepository extends JpaRepository<AttendanceToken, Long> {
    Optional<AttendanceToken> findByToken(String token);
    Optional<AttendanceToken> findTopByEventIdOrderByExpiresAtDesc(Long eventId);
}
