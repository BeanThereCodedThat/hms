# HMS — Hospital Management System
### Occupational Health Centre (OHC)

A complete, production-ready web application for managing an industrial OHC dispensary.

---

## Features

| Module | Features |
|---|---|
| **Employee Management** | CRUD, search, family members, medical history, smart card |
| **Doctor Management** | CRUD, availability, shift management, status updates |
| **OPD Visits** | Walk-in registration, consultation, prescription, dispense |
| **Medicine Inventory** | CRUD, stock in/out, expiry tracking, color-coded alerts |
| **Vaccinations** | Records, tracking, upcoming/overdue alerts |
| **Health Checkups** | Scheduling, tracking, reminders |
| **First Aid Boxes** | Box management, item allocation, consumption tracking |
| **Documents** | Upload/download PDF, JPG, PNG attached to records |
| **Notifications** | Dashboard alerts for low stock, expiry, vaccinations |
| **Reports** | OPD, inventory, stock movement, vaccination, checkup reports |
| **User Management** | RBAC with Admin, Doctor, Pharmacist, OPD Staff roles |
| **Audit Logging** | createdBy/At, updatedBy/At on all entities |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3, Spring Security, JPA/Hibernate |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Database | MySQL 8 |
| Auth | JWT (stateless) |
| Deployment | Docker + Docker Compose |

---

## Quick Start

### Option 1 — Docker Compose (Recommended)

```bash
# 1. Clone / download the project
cd dms

# 2. Copy environment template
cp .env.example .env

# 3. (Optional) Edit .env with your passwords

# 4. Build and start all services
docker-compose up --build -d

# 5. Open browser
# Frontend: http://localhost
# Backend API: http://localhost:8080/api
```

### Option 2 — Local Development

**Prerequisites:** Java 21, Maven, Node.js 20+, MySQL 8

#### Backend
```bash
cd backend

# Update src/main/resources/application.properties with your MySQL credentials

mvn spring-boot:run
# API starts at http://localhost:8080
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# UI starts at http://localhost:5173
```

---

## Default Login Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Doctor | `doctor1` | `doctor123` |
| Pharmacist | `pharmacist1` | `pharma123` |
| OPD Staff | `staff1` | `staff123` |

> **Important:** Change all passwords immediately after first login in production.

---

## Database Setup

Tables are created **automatically** on first startup via Hibernate (`ddl-auto=update`).

- No manual SQL scripts required
- Safe to restart — existing data is preserved
- Schema evolves safely with application updates

---

## Project Structure

```
dms/
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/dms/
│   │   ├── config/           # Security, JPA Auditing, Data Initializer
│   │   ├── controller/       # REST controllers
│   │   ├── dto/              # Data transfer objects
│   │   ├── entity/           # JPA entities
│   │   ├── enums/            # Enumerations
│   │   ├── exception/        # Global exception handler
│   │   ├── repository/       # Spring Data JPA repositories
│   │   ├── security/         # JWT filter, UserDetailsService
│   │   └── service/          # Business logic services
│   └── src/main/resources/
│       └── application.properties
│
├── frontend/                 # React application
│   └── src/
│       ├── api/              # Axios API clients
│       ├── components/       # Reusable UI components
│       │   ├── layout/       # Sidebar, Layout wrapper
│       │   └── ui/           # Buttons, Modal, Table, Badges
│       ├── context/          # AuthContext (JWT state)
│       ├── pages/            # Route pages
│       │   ├── auth/         # Login page
│       │   ├── employees/    # List, Form, Detail
│       │   ├── visits/       # OPD Register, Visit Detail
│       │   ├── medicines/    # List, Form, Stock Management
│       │   ├── doctors/      # Doctor list with status
│       │   ├── vaccinations/ # Vaccination tracking
│       │   ├── checkups/     # Health checkup scheduling
│       │   ├── firstaid/     # First aid box management
│       │   ├── reports/      # All reports with charts
│       │   └── settings/     # User management (Admin)
│       └── types/            # TypeScript type definitions
│
├── docker-compose.yml        # Full stack deployment
├── .env.example              # Environment template
└── README.md
```

---

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/dashboard` | Dashboard metrics |
| GET/POST | `/api/employees` | Employee management |
| GET/POST | `/api/employees/{id}/family` | Family members |
| GET/POST | `/api/doctors` | Doctor management |
| GET/POST | `/api/visits` | OPD visit management |
| POST | `/api/visits/{id}/prescription` | Add prescription |
| POST | `/api/visits/{id}/dispense` | Dispense medicines |
| POST | `/api/visits/{id}/close` | Close visit |
| GET/POST | `/api/medicines` | Medicine CRUD |
| POST | `/api/medicines/transaction` | Stock transaction |
| GET/POST | `/api/vaccinations` | Vaccination records |
| GET/POST | `/api/checkups` | Health checkups |
| GET/POST | `/api/first-aid-boxes` | First aid boxes |
| POST | `/api/documents/upload` | File upload |
| GET | `/api/documents/{id}/download` | File download |
| GET | `/api/notifications` | Get notifications |
| GET | `/api/reports/opd` | OPD report |
| GET | `/api/reports/inventory` | Inventory report |
| GET/POST | `/api/users` | User management (Admin) |

---

## Role Permissions

| Feature | ADMIN | DOCTOR | PHARMACIST | OPD_STAFF |
|---|---|---|---|---|
| View Dashboard | ✓ | ✓ | ✓ | ✓ |
| Manage Employees | ✓ | — | — | ✓ |
| Manage Doctors | ✓ | — | — | — |
| Register OPD Visit | ✓ | ✓ | — | ✓ |
| Write Prescription | ✓ | ✓ | — | — |
| Dispense Medicines | ✓ | — | ✓ | — |
| Manage Medicines | ✓ | — | ✓ | — |
| Stock Transactions | ✓ | — | ✓ | — |
| Vaccinations | ✓ | ✓ | — | ✓ |
| Reports | ✓ | ✓ | ✓ | ✓ |
| User Management | ✓ | — | — | — |

---

## Production Checklist

- [ ] Change all default passwords
- [ ] Set a strong `JWT_SECRET` (32+ random characters)
- [ ] Configure MySQL with a dedicated user and strong password
- [ ] Set up HTTPS (reverse proxy via Nginx/Traefik)
- [ ] Configure automated MySQL backups
- [ ] Set `dms.upload.dir` to a persistent volume path
- [ ] Review CORS origins in `.env` / `application.properties`
- [ ] Set up log rotation

---

## License

Proprietary — For internal OHC use only.
