# 🎓 CampusEvent Pro — College Event Management & Scheduling System

A production-grade, full-stack College Event Management & Scheduling platform built with **Spring Boot 3 (Java 17/21)**, **Spring Security**, **JWT authentication**, **Spring Data JPA**, **MySQL**, **ZXing QR-Code generation**, and **React 18 (Vite)** with a modern, responsive user experience.

---

## 🚀 Key Features

### 👥 Multi-Role Authorization & Security
- **Role-Based Access Control (RBAC):** Backend-enforced authorization across 3 roles: `ADMIN`, `FACULTY`, `STUDENT`.
- **Stateless JWT Authentication:** 24-hour expiration token containing user identity and roles; evaluated via custom `JwtAuthenticationFilter`.
- **Public Protection:** Public self-registration only permits `STUDENT` and `FACULTY`. `ADMIN` registration is strictly forbidden and rejected.
- **BCrypt Encryption:** Passwords salted and hashed with BCrypt; excluded from all API responses via DTOs and `@JsonIgnore`.

### 🏛️ Venue Scheduling & Overlap Conflict Prevention
- **Automated Conflict Detection:** Prevents two events from booking the same venue at overlapping hours on the same date using strict boundary checking:
  ```sql
  existing.startTime < new.endTime AND existing.endTime > new.startTime
  ```
- Rejects conflicting requests with `Venue already booked for this time`.
- Enforces event capacity $\le$ venue capacity.

### 📅 Event Lifecycle & Approval Workflow
- Newly submitted events enter `PENDING` status.
- Only administrators can review, approve, or reject events.
- Students can only register for `APPROVED` events with remaining seats.
- Automatic notification dispatch to organizers upon status changes.

### 🎫 Student Event Registration
- 1-click registration and cancellation for students.
- Unique constraint `(event_id, student_id)` strictly prohibits duplicate registration.
- Atomic seat quota tracking prevents overbooking.

### 📱 Real-Time QR Code Attendance (ZXing)
- Instructors & organizers generate dynamic 300x300 Base64 PNG QR codes with single-use secure UUID tokens.
- QR codes expire automatically after **30 minutes**.
- Students scan or submit tokens; the system validates registration, token expiration, and prevents duplicate check-ins.

### 🔔 Integrated Notification Engine
- Event approvals & rejections notify organizers.
- Registration confirmations and attendance verification notify students.
- Unread notification badges update in real-time.

### 📊 Real-Time Analytics Dashboard
- Campus-wide metrics: Total events, approved/pending/rejected breakdown, total registrations, verified attendances, user and venue counts.
- Per-event statistics: Capacity, registration counts, attendance ratios, and remaining seats.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | Java 17 / 21, Spring Boot 3.3.4 |
| **Security & Auth** | Spring Security 6, JJWT 0.11.5, BCrypt |
| **Data & Persistence** | Spring Data JPA, Hibernate, MySQL Connector/J 8.0, H2 (Testing) |
| **QR Code Engine** | Google ZXing (core & javase 3.5.3) |
| **Validation** | Jakarta Bean Validation (Hibernate Validator) |
| **Frontend UI** | React 18, Vite 5, React Router DOM 6 |
| **HTTP Client** | Axios (with token interceptor & error redirects) |
| **Icons & Styling** | Lucide React, Custom Responsive CSS Design System |

---

## 📁 System Architecture & Directory Structure

```
.
├── 01_Backend/
│   ├── pom.xml
│   ├── .env.example
│   └── src/
│       ├── main/
│       │   ├── java/com/college/event/
│       │   │   ├── CollegeEventApplication.java
│       │   │   ├── config/
│       │   │   │   └── SecurityConfig.java
│       │   │   ├── security/
│       │   │   │   ├── CustomUserDetailsService.java
│       │   │   │   ├── JwtAuthenticationFilter.java
│       │   │   │   ├── JwtTokenProvider.java
│       │   │   │   └── UserPrincipal.java
│       │   │   ├── model/
│       │   │   │   ├── User.java, Role.java
│       │   │   │   ├── Event.java, EventStatus.java
│       │   │   │   ├── Venue.java, Registration.java
│       │   │   │   ├── Notification.java, AttendanceToken.java
│       │   │   ├── repository/
│       │   │   │   ├── UserRepository.java, EventRepository.java
│       │   │   │   ├── VenueRepository.java, RegistrationRepository.java
│       │   │   │   ├── NotificationRepository.java, AttendanceTokenRepository.java
│       │   │   ├── service/
│       │   │   │   ├── AuthService.java, EventService.java
│       │   │   │   ├── VenueService.java, RegistrationService.java
│       │   │   │   ├── AttendanceService.java, NotificationService.java
│       │   │   │   └── AnalyticsService.java
│       │   │   ├── controller/
│       │   │   │   ├── AuthController.java, EventController.java
│       │   │   │   ├── VenueController.java, RegistrationController.java
│       │   │   │   ├── AttendanceController.java, NotificationController.java
│       │   │   │   ├── AnalyticsController.java, AdminController.java
│       │   │   ├── dto/
│       │   │   └── exception/
│       │   │       ├── GlobalExceptionHandler.java
│       │   │       └── ResourceNotFoundException, BadRequestException, ConflictException
│       │   └── resources/
│       │       └── application.properties
│       └── test/
│           ├── java/com/college/event/
│           │   ├── AuthServiceTest.java
│           │   └── EventAndRegistrationServiceTest.java
│           └── resources/
│               └── application-test.properties
│
└── 02_Frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── components/
        │   ├── Navbar.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── EventCard.jsx
        │   └── Loading.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   ├── Events.jsx
        │   ├── CreateEvent.jsx
        │   ├── MyEvents.jsx
        │   ├── Venues.jsx
        │   ├── Notifications.jsx
        │   ├── Attendance.jsx
        │   └── AdminDashboard.jsx
        └── services/
            └── api.js
```

---

## 🗄️ Database Setup

The application runs immediately with a file-based H2 database by default. The database is stored under `01_Backend/data/college_event_db` and is created automatically on startup.

### Optional MySQL Setup

1. Open your MySQL client or terminal:
   ```sql
   CREATE DATABASE IF NOT EXISTS college_event_db;
   ```
2. Set the following environment variables before starting the backend (or update `01_Backend/src/main/resources/application.properties`):
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/college_event_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=root
   ```
3. Hibernate automatically provisions all tables, foreign keys, unique constraints, and initial venues on startup!

---

## ⚡ Quick Start Guide

### 1. Run Backend (Spring Boot)
Ensure Java 17+ is installed. Run with Maven from the `01_Backend/` directory:
```bash
cd 01_Backend
mvn spring-boot:run
```
The server will boot on `http://localhost:8080`.

> **Pre-configured Administrator Account:**
> On first startup, the application seeds the default administrator account:
> - **Email:** `admin440@gmail.com`
> - **Password:** `1234567`
> - **Role:** `ADMIN`

### 2. Run Frontend (React + Vite)
In a separate terminal:
```bash
cd 02_Frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📋 REST API Specification

| Method | Endpoint | Authorization | Allowed Roles | Description |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public | All | Register student, faculty, or coordinator (rejects ADMIN) |
| `POST` | `/api/auth/login` | Public | All | Authenticate and obtain JWT token |
| `GET` | `/api/events` | Public | All | Browse approved/filtered events (category, date, search) |
| `GET` | `/api/events/{id}` | Public | All | Get detailed event information |
| `POST` | `/api/events` | Authenticated | `FACULTY`, `ADMIN` | Schedule event (starts as PENDING; checks venue overlap) |
| `PUT` | `/api/events/{id}` | Authenticated | Organizer or `ADMIN` | Update event information |
| `DELETE` | `/api/events/{id}` | Authenticated | Organizer or `ADMIN` | Delete event |
| `PUT` | `/api/events/{id}/status` | Authenticated | `ADMIN` | Approve or Reject event (`status: APPROVED / REJECTED`) |
| `GET` | `/api/venues` | Authenticated | All authenticated | View campus venues & capacities |
| `POST` | `/api/venues` | Authenticated | `ADMIN` | Create new campus venue |
| `PUT` | `/api/venues/{id}` | Authenticated | `ADMIN` | Update venue capacity / status |
| `DELETE` | `/api/venues/{id}` | Authenticated | `ADMIN` | Delete venue |
| `POST` | `/api/registrations/event/{id}` | Authenticated | `STUDENT` | Register for approved event |
| `DELETE` | `/api/registrations/event/{id}` | Authenticated | `STUDENT` | Cancel registration |
| `GET` | `/api/registrations/my-events` | Authenticated | `STUDENT` | View current student's registered events |
| `GET` | `/api/registrations/event/{id}` | Authenticated | Organizer or `ADMIN` | View attendee list for event |
| `PUT` | `/api/registrations/{id}/attendance`| Authenticated | Organizer or `ADMIN` | Manually mark attendee present/absent |
| `GET` | `/api/attendance/qr/{eventId}` | Authenticated | Organizer or `ADMIN` | Generate 30-min ZXing QR code PNG |
| `POST` | `/api/attendance/scan` | Authenticated | `STUDENT` (or all auth) | Verify attendance token from QR scan |
| `GET` | `/api/notifications` | Authenticated | All authenticated | Get notifications for logged-in user |
| `PUT` | `/api/notifications/{id}/read` | Authenticated | Notification Owner | Mark notification as read |
| `GET` | `/api/analytics/dashboard` | Authenticated | `ADMIN`, `FACULTY` | Global system KPIs |
| `GET` | `/api/analytics/event/{id}` | Authenticated | `ADMIN`, `FACULTY` | Detailed event analytics & percentage |
| `GET` | `/api/admin/users` | Authenticated | `ADMIN` | Manage registered user directory |
| `DELETE` | `/api/admin/users/{id}` | Authenticated | `ADMIN` | Delete user account |

---

## 🧪 Testing Backend Services

Automated unit & integration tests use an in-memory H2 database to verify:
- Registration, BCrypt password hashing, and ADMIN rejection.
- Login and JWT claim verification.
- Venue overlapping conflict logic.
- Approval workflows and student registration constraints (capacity, approval, duplicates).
- ZXing QR generation, expiry validation, and double check-in prevention.

Run tests:
```bash
cd 01_Backend
mvn test
```

---

## 🛡️ Security Best Practices Implemented

1. **No Sensitive Data Leaks:** Passwords are never sent over API responses.
2. **True Principal Retrieval:** All user actions (organizer verification, attendance registration) extract identity strictly from `SecurityContextHolder.getContext().getAuthentication().getName()`. Frontend inputs cannot spoof identities.
3. **CORS Protected:** Configured securely with exposed authorization headers and origin controls.
4. **Structured Error Handling:** Clean RFC 7807-compliant JSON error bodies containing timestamp, HTTP status, message, and path.
