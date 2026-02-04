# BrainX - Educational Management System

BrainX is a comprehensive Educational Management System (EMS) designed to streamline the administration of online courses, live classes, and student assessments. It provides a robust platform for institutions to manage enrollments, schedule meetings (Zoom/Google Meet), and facilitate communication between teachers, students, and parents.

## 🚀 Project Overview

BrainX serves as a centralized hub for educational activities, solving the fragmentation problem in managing online education. It connects:

- **Administrators**: To manage courses, batches, and users.
- **Teachers**: To schedule classes, track attendance, and upload materials.
- **Students**: To access courses, join live sessions, and track progress.
- **Parents**: To monitor their child's performance.

Key capabilities include automated enrollment, seamless video conferencing integration, and real-time chat.

## ✨ Features

- **Role-Based Access Control**: Secure access for Admin, Teacher, Student, and Parent roles.
- **Course & Batch Management**: specific structuring of curriculums into courses and batches.
- **Live Class Scheduling**: Automatic integration with **Zoom** and **Google Meet** for generating meeting links.
- **Auto-Enrollment System**: Automated processing of student enrollments into batches and chat groups.
- **Real-time Communication**: Integrated group chats for batch-level discussions.
- **Assessment & Badges**: Tracking student progress with assessments and gamified badges.
- **File Management**: Secure upload and storage of course materials using **Bunny.net**.
- **Assessment & Grading**: Tools for teachers to grade and review student performance.

## 🏗 System Architecture

The system follows a modern client-server architecture.

```mermaid
graph TD
    Client[User Client (Browser)] -->|HTTPS| Frontend[Frontend (React + Vite)]
    Frontend -->|REST API| Backend[Backend (FastAPI)]

    subgraph "Backend Layer"
        Backend -->|Auth| Auth[JWT Authentication]
        Backend -->|ORM| DB[(PostgreSQL Database)]
        Backend -->|Caching| Cache[(Redis/Memory)]
    end

    subgraph "External Services"
        Backend -->|Meeting API| Zoom[Zoom API]
        Backend -->|Meeting API| GMeet[Google Meet]
        Backend -->|Storage| Bunny[Bunny.net Storage]
    end
```

### Backend Layered Architecture

The backend is structured into modular layers to separate concerns and improve maintainability:

```mermaid
graph LR
    REQ[Client Request] --> API[API Endpoints]
    API --> SVC[Service Layer]
    SVC --> CRUD[CRUD Operations]
    CRUD --> DB[(PostgreSQL)]

    subgraph "Business Logic & Data Access"
        API
        SVC
        CRUD
    end

    SVC -.-> EXT[External Integrations]
    EXT --> ZOOM[Zoom/GMeet]
    EXT --> BUNNY[Bunny.net]
```

### Core Workflow: Live Class Join

A sequence diagram illustrating the flow when a student attempts to join a live class:

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API as Backend API
    participant DB as Database
    participant Provider as Zoom/GMeet

    User->>Frontend: Clicks "Join Class"
    Frontend->>API: GET /classes/{id}/join
    API->>DB: Validate User & Enrollment
    DB-->>API: Enrollment Active
    API->>API: Check Class Schedule
    alt Class is Live
        API->>Provider: Get/Generate Meeting Link
        Provider-->>API: Meeting URL
        API-->>Frontend: Returns Join URL
        Frontend->>User: Redirects to Meeting
    else Class not started
        API-->>Frontend: 403 Forbidden (Too Early)
        Frontend-->>User: Show "Class Not Started"
    end
```

## 🧩 Architecture Explanation

- **Frontend**: Built with **React** and **Vite**, styled with **TailwindCSS**. It provides a responsive SPA (Single Page Application) experience.
- **Backend**: Powered by **FastAPI** (Python), offering high performance and automatic API documentation. It adheres to RESTful principles.
- **Database**: **PostgreSQL** is used for persistent storage, managed via **SQLAlchemy** (ORM) and **Alembic** (migrations).
- **Authentication**: Secure JWT (JSON Web Token) based authentication with password hashing (Bcrypt).
- **External Integrations**:
  - **Bunny.net**: For efficient file storage and CDN delivery.
  - **Zoom / Google Meet**: For generating dynamic live class links.

## �️ Database Schema

The database is normalized and structured to support scalable educational operations. Below is the Entity-Relationship (ER) diagram for the core modules.

```mermaid
erDiagram
    USERS ||--o{ ENROLLMENTS : "has"
    USERS ||--o{ BATCH_MEMBERS : "belongs_to"
    USERS ||--o{ BATCHES : "teaches"

    COURSES ||--o{ BATCHES : "defines"
    COURSES ||--o{ ENROLLMENTS : "enrolled_in"

    BATCHES ||--o{ BATCH_MEMBERS : "contains"
    BATCHES ||--o{ CLASS_SESSIONS : "schedules"
    BATCHES ||--o{ CHATS : "has_channel"

    USERS {
        uuid id PK
        string full_name
        string email
        string password_hash
        enum role "admin, teacher, student, parent"
    }

    COURSES {
        int id PK
        string title
        string level
        int duration_hours
        int provider_id FK
    }

    BATCHES {
        int id PK
        string batch_name
        int course_id FK
        uuid teacher_id FK
        date start_date
    }

    ENROLLMENTS {
        int id PK
        uuid student_id FK
        int course_id FK
        enum status "active, completed"
    }

    BATCH_MEMBERS {
        int id PK
        int batch_id FK
        uuid user_id FK
        enum role "student, teacher"
    }

    CLASS_SESSIONS {
        int id PK
        int batch_id FK
        datetime start_time
        string meeting_link
    }
```

## �🛠 Technology Stack

| Component      | Technology                    | Description                          |
| -------------- | ----------------------------- | ------------------------------------ |
| **Frontend**   | React 19, Vite                | Modern UI Library & Build Tool       |
| **Styling**    | TailwindCSS                   | Utility-first CSS framework          |
| **Backend**    | General Python 3.12+, FastAPI | High-performance async web framework |
| **Database**   | PostgreSQL                    | Relational Database                  |
| **ORM**        | SQLAlchemy (Async)            | Python SQL Toolkit                   |
| **Migrations** | Alembic                       | Database migration tool              |
| **Auth**       | OAuth2 / JWT                  | Secure authentication                |
| **Storage**    | Bunny.net                     | Cloud object storage                 |
| **Runtime**    | Uvicorn                       | ASGI Server                          |

## 📂 Project Structure

```bash
root/
├── backend/                # FastAPI Backend
│   ├── app/
│   │   ├── api/            # API Endpoints (v1)
│   │   ├── core/           # Config & Security
│   │   ├── crud/           # Database CRUD operations
│   │   ├── db/             # Database session & base models
│   │   ├── models/         # SQLAlchemy Models
│   │   ├── schemas/        # Pydantic Schemas
│   │   └── main.py         # App Entry Point
│   ├── alembic/            # Migration scripts
│   ├── requirements.txt    # Python dependencies
│   └── seed_db.py          # Database seeding script
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application Pages
│   │   └── services/       # API call definitions
│   ├── package.json        # JS dependencies
│   └── vite.config.js      # Vite configuration
└── README.md               # Project Documentation
```

## ⚙️ Installation Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/brainx.git
cd brainx
```

### 2. Backend Setup

Navigate to the backend directory and set up the virtual environment.

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend Setup

Navigate to the frontend directory and install dependencies.

```bash
cd ../frontend
npm install
```

## 🚀 Running the Application

### Start Backend Server

Ensure your database is running and configured in `.env`.

```bash
# In backend/ directory
source venv/bin/activate
python -m uvicorn app.main:app --reload
```

Review API Docs at: `http://localhost:8000/docs`

### Start Frontend Client

```bash
# In frontend/ directory
npm run dev
```

Access the App at: `http://localhost:5173`

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory based on the following template:

```ini
# General
PROJECT_NAME="Brainx"
API_V1_STR="/api/v1"

# Database
DATABASE_URL="postgresql+asyncpg://user:password@localhost/brainx_db"

# Security
SECRET_KEY="your_super_secret_key"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=11520

# Storage (Bunny.net)
BUNNY_API_KEY="your_bunny_api_key"
BUNNY_STORAGE_ZONE="brainx"
BUNNY_REGION="de"

# Meeting Providers
ZOOM_API_KEY=""
ZOOM_API_SECRET=""
ZOOM_ACCOUNT_ID=""

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI=""
```

## 📖 API Documentation

The backend provides auto-generated interactive API documentation.

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints

| Resource        | Method | Endpoint                        | Description                 |
| :-------------- | :----- | :------------------------------ | :-------------------------- |
| **Auth**        | `POST` | `/api/v1/login/access-token`    | Login & get JWT token       |
|                 | `POST` | `/api/v1/login/test-token`      | Test current token validity |
| **Users**       | `GET`  | `/api/v1/users/`                | List all users (Admin)      |
|                 | `POST` | `/api/v1/users/`                | Create a new user           |
|                 | `GET`  | `/api/v1/users/me`              | Get current logged-in user  |
| **Courses**     | `GET`  | `/api/v1/courses/`              | List available courses      |
|                 | `POST` | `/api/v1/courses/`              | Create a new course         |
|                 | `PUT`  | `/api/v1/courses/{id}`          | Update course details       |
| **Batches**     | `GET`  | `/api/v1/classes/`              | List all batches            |
|                 | `POST` | `/api/v1/classes/`              | Create a new batch          |
|                 | `GET`  | `/api/v1/classes/{id}`          | Get batch details           |
|                 | `POST` | `/api/v1/classes/{id}/members/` | Add user to batch           |
| **Enrollments** | `POST` | `/api/v1/enrollments/`          | Enroll student in course    |
|                 | `GET`  | `/api/v1/enrollments/me`        | Get my enrollments          |
| **Meetings**    | `POST` | `/api/v1/meetings/create`       | Create Zoom/Meet link       |
|                 | `GET`  | `/api/v1/meetings/`             | List scheduled meetings     |
| **Assessments** | `GET`  | `/api/v1/assessments/`          | List assessments            |
|                 | `POST` | `/api/v1/assessments/submit`    | Submit assessment answers   |

## 🧪 Testing

To run backend tests (ensure `pytest` is installed):

```bash
cd backend
pytest
```

## 🐳 Deployment

### Docker (Recommended)

Create `Dockerfile` for both services and use `docker-compose`.

1. Build images:
   ```bash
   docker-compose build
   ```
2. Run containers:
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

- **Frontend**: Build using `npm run build` and serve the `dist/` folder using Nginx or Vercel/Netlify.
- **Backend**: Run using a production ASGI server like Gunicorn with Uvicorn workers.
  ```bash
  gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app
  ```

## 🔮 Future Enhancements

- [ ] Comprehensive Notification System (Email/SMS)
- [ ] Mobile Application (React Native)
- [ ] Advanced Analytics Dashboard for Admins
- [ ] Payment Gateway Integration

## 🤝 Contributing Guidelines

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
