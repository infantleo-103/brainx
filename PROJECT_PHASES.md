# 🚀 Project Roadmap & Phasing Strategy

This document outlines the development roadmap for the BrainX Educational Management System, divided into 4 strategic phases. Each phase allows for iterative testing and value delivery.

---

## 📅 Phase 1: Foundation & User Administration

**Goal:** Establish the core infrastructure, security, and user management systems.
**Status:** ✅ Completed / In-Progress

### Backend Tasks

- [x] **Project Setup**: Initialize FastAPI, Git repo, and Virtual Environment.
- [x] **Database Design**: Define Schemas for Users, Roles, and Permissions.
- [x] **Authentication**: Implement JWT (Access/Refresh Tokens) and Password Hashing (Bcrypt).
- [ ] **User Management API**:
  - CRUD User (Admin only).
  - `GET /me` (Self profile).
  - Role assignment (Admin, Teacher, Student, Parent).
- [ ] **Security**: Setup CORS, `.env` management, and API rate limiting.

### Frontend Tasks

- [x] **Scaffolding**: Setup Vite + React + TailwindCSS.
- [ ] **Auth Pages**: Login, Forgot Password, and Reset Password screens.
- [ ] **Layouts**: Create responsive layouts for Dashboard (Sidebar + Navbar).
- [ ] **Route Guarding**: Implement Protected Routes ensuring role-based access.

---

## 📚 Phase 2: Academic Core & Scheduling

**Goal:** Enable the creation and management of Courses, Batches, and Enrollments.
**Status:** 🚧 In Development

### Backend Tasks

- [ ] **Course Module**:
  - CRUD for Courses (Title, Description, Level).
  - Categorization and tagging.
- [ ] **Batch Management**:
  - Create Batches linked to Courses.
  - Assign Teachers to Batches.
  - Set Start/End dates and Schedule times.
- [ ] **Enrollment System**:
  - API to enroll Students into specific Batches.
  - Validation (Duplicate checks, Capacity limits).
- [ ] **Teacher Schedule**:
  - API to fetch assigned batches and slots.

### Frontend Tasks

- [ ] **Admin Dashboard**:
  - Data Grids/Tables for managing Courses and Batches.
  - User enrollment interface.
- [ ] **Student Dashboard**:
  - "My Courses" view.
  - "Upcoming Classes" widget.
- [ ] **Teacher Dashboard**:
  - "My Schedule" view.
  - Batch student list view.

---

## 🎥 Phase 3: Live Classroom & Real-time Collaboration

**Goal:** Integrate live video conferencing and real-time communication tools.

### Backend Tasks

- [ ] **Meeting Integrations**:
  - **Zoom API**: Generate meeting links for classes.
  - **Google Meet**: Alternate meeting provider integration.
- [ ] **Live Class Management**:
  - Logic to determine "Is Class Live Now?".
  - Store meeting recordings/links.
- [ ] **Communication**:
  - **Chat System**: Create chat groups automatically per Batch.
  - Socket.IO / WebSocket implementation for real-time messaging.
- [ ] **File Storage**:
  - Integrate **Bunny.net** for uploading Study Materials.

### Frontend Tasks

- [ ] **Classroom Interface**:
  - "Join Class" button logic (Active only when teacher starts).
  - Embedded video player or Redirect logic.
- [ ] **Chat UI**:
  - Slack-like chat interface for Batch groups.
  - File attachment previews.
- [ ] **Notifications**:
  - Toasts/Alerts for "Class Starting Soon".

---

## 🏆 Phase 4: Assessment, Gamification & Analytics

**Goal:** Measure student performance, drive engagement, and provide actionable insights.

### Backend Tasks

- [ ] **Assessment Engine**:
  - CRUD for Assignments/Quizzes.
  - Submission endpoints for Students.
- [ ] **Grading System**:
  - Teacher grading interfaces.
  - Automated grading for multiple-choice questions.
- [ ] **Gamification**:
  - **Badges**: Award logic (e.g., "Perfect Attendance", "Top Scorer").
  - **Leaderboards**: Per batch ranking.
- [ ] **Reporting & Analytics**:
  - Weekly attendance reports.
  - Course completion rates.
  - Export data to CSV/PDF.

### Frontend Tasks

- [ ] **Exam Interface**:
  - Timed quiz UI.
  - File upload for homework submissions.
- [ ] **Progress Tracking**:
  - Visual graphs (Chart.js / Recharts) for student grades.
- [ ] **Profile & Badges**:
  - Display earned badges on Student Profile.
- [ ] **Mobile Responsiveness**:
  - Final polish for mobile/tablet views.

---

## 🔮 Future Considerations (Post-Phase 4)

- **Payment Gateway**: Stripe/Razorpay integration for paid courses.
- **Mobile App**: React Native build.
- **AI Tutor**: LLM integration for doubts assistance.
