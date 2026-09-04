package com.college.event.repository;

import com.college.event.model.Event;
import com.college.event.model.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStatus(EventStatus status);

    List<Event> findByOrganizerId(Long organizerId);

    @Query("SELECT e FROM Event e WHERE e.venue.id = :venueId " +
           "AND e.date = :date " +
           "AND e.status != 'REJECTED' " +
           "AND (:eventId IS NULL OR e.id != :eventId) " +
           "AND e.startTime < :endTime " +
           "AND e.endTime > :startTime")
    List<Event> findConflictingEvents(
        @Param("venueId") Long venueId,
        @Param("date") LocalDate date,
        @Param("startTime") LocalTime startTime,
        @Param("endTime") LocalTime endTime,
        @Param("eventId") Long eventId
    );

    long countByStatus(EventStatus status);
}
