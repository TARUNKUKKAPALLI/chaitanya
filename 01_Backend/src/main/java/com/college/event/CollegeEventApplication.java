package com.college.event;

import com.college.event.model.Venue;
import com.college.event.repository.VenueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class CollegeEventApplication {

    private static final Logger logger = LoggerFactory.getLogger(CollegeEventApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(CollegeEventApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDefaultVenues(VenueRepository venueRepository) {
        return args -> {
            try {
                if (venueRepository.count() == 0) {
                    logger.info("Seeding initial campus venues...");
                    venueRepository.saveAll(List.of(
                        new Venue("Main Auditorium", "Central Campus, Block A", 500, true),
                        new Venue("Tech Seminar Hall", "Science & Engineering Building, 2nd Floor", 150, true),
                        new Venue("Open Amphitheater", "Near Student Activity Center", 300, true),
                        new Venue("Conference Hall B", "Administrative Block, 1st Floor", 80, true),
                        new Venue("Innovation Hub Lab", "IT Complex, Ground Floor", 60, true)
                    ));
                    logger.info("Sample campus venues initialized successfully.");
                }
            } catch (Exception e) {
                logger.warn("Could not seed default venues: {}", e.getMessage());
            }
        };
    }
}
