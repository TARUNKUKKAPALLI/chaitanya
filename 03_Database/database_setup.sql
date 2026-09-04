-- =========================================================
-- College Event Management & Scheduling System Database Setup
-- Database: college_event_db
-- =========================================================

CREATE DATABASE IF NOT EXISTS `college_event_db` 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `college_event_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'FACULTY', 'STUDENT') NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Venues Table
CREATE TABLE IF NOT EXISTS `venues` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `capacity` INT NOT NULL,
    `available` BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Events Table
CREATE TABLE IF NOT EXISTS `events` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `date` DATE NOT NULL,
    `start_time` TIME NOT NULL,
    `end_time` TIME NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `organizer_id` BIGINT NOT NULL,
    `capacity` INT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `venue_id` BIGINT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_events_organizer` FOREIGN KEY (`organizer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_events_venue` FOREIGN KEY (`venue_id`) REFERENCES `venues` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Registrations Table
CREATE TABLE IF NOT EXISTS `registrations` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `event_id` BIGINT NOT NULL,
    `student_id` BIGINT NOT NULL,
    `registration_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `attended` BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT `uk_event_student` UNIQUE (`event_id`, `student_id`),
    CONSTRAINT `fk_reg_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reg_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT NOT NULL,
    `message` TEXT NOT NULL,
    `read_status` BOOLEAN NOT NULL DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Attendance Tokens Table (ZXing QR Codes)
CREATE TABLE IF NOT EXISTS `attendance_tokens` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `token` VARCHAR(64) NOT NULL UNIQUE,
    `event_id` BIGINT NOT NULL,
    `expires_at` DATETIME NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_tokens_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- Initial Campus Venues Seed Data
-- =========================================================
INSERT INTO `venues` (`name`, `location`, `capacity`, `available`) VALUES
('Main Auditorium', 'Central Campus, Block A', 500, TRUE),
('Tech Seminar Hall', 'Science & Engineering Building, 2nd Floor', 150, TRUE),
('Open Amphitheater', 'Near Student Activity Center', 300, TRUE),
('Conference Hall B', 'Administrative Block, 1st Floor', 80, TRUE),
('Innovation Hub Lab', 'IT Complex, Ground Floor', 60, TRUE)
ON DUPLICATE KEY UPDATE `name`=`name`;

-- =========================================================
-- Default System Administrator Account Seed
-- Email: admin440@gmail.com | Password: 1234567
-- (BCrypt Hash: $2a$10$7R0ZqB5aQ59L5LwL8bUv1eq8b9RzPZ4xNq.2u0u5R0ZqB5aQ59L5L)
-- =========================================================
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('System Administrator', 'admin440@gmail.com', '$2a$10$lPZxQU3q6zUpIH5ebVHdG.hrwSCCj.UUe8/sNCvOPGXqfjtRtp4cK', 'ADMIN')
ON DUPLICATE KEY UPDATE `email`=`email`;
