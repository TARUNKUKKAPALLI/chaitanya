package com.college.event.repository;

import com.college.event.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    Optional<Registration> findByEventIdAndStudentId(Long eventId, Long studentId);

    boolean existsByEventIdAndStudentId(Long eventId, Long studentId);

    List<Registration> findByStudentIdOrderByRegistrationDateDesc(Long studentId);

    List<Registration> findByEventIdOrderByRegistrationDateDesc(Long eventId);

    long countByEventId(Long eventId);

    long countByEventIdAndAttendedTrue(Long eventId);

    long countByAttendedTrue();
}
