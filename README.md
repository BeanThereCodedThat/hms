# HMS — Hospital Management System

A production-ready full-stack web application for managing an industrial Occupational Health Centre (OHC) dispensary.

## Features

| Module | Description |
|---|---|
| Employee Management | CRUD, search, family members, medical history |
| Doctor Management | Availability, shift management, status updates |
| OPD Visits | Walk-in registration, consultation, prescription, dispense workflow |
| Medicine Inventory | Stock in/out, expiry tracking, color-coded alerts |
| Vaccinations | Records, tracking, upcoming/overdue alerts |
| Health Checkups | Scheduling, tracking, reminders |
| First Aid Boxes | Box management, item allocation, consumption tracking |
| Documents | Upload/download PDF, JPG, PNG attached to records |
| Notifications | Dashboard alerts for low stock, expiry, vaccinations |
| Reports | OPD, inventory, stock movement, vaccination, checkup reports |
| User Management | RBAC with 4 roles |
| Audit Logging | createdBy/At, updatedBy/At on all entities |

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3, Spring Security, JPA/Hibernate |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Database | MySQL 8 |
| Auth | JWT (stateless) |
| Deployment | Docker + Docker Compose |

## Quick Start

### Option 1 — Docker Compose (Recommended)

```bash
cd dms
cp .env.example .env
docker-compose up --build -d
# Frontend: http://localhost
# Backend API: http://localhost:8080/api
```

### Option 2 — Local Development

**Prerequisites:** Java 21, Maven, Node.js 20+, MySQL 8

```bash
# Backend
cd backend
# Update application.properties with your MySQL credentials
mvn spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```

## Default Credentials

| Role | Username | Password |
|---|---|---|
| Admin | admin | admin123 |
| Doctor | doctor1 | doctor123 |
| Pharmacist | pharmacist1 | pharma123 |
| OPD Staff | staff1 | staff123 |

> Change all passwords before deploying to production.

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

## Project Structure

```
dms/
├── backend/                  # Spring Boot application
│   └── src/main/java/com/dms/
│       ├── config/           # Security, JPA Auditing
│       ├── controller/       # REST controllers
│       ├── dto/              # Data transfer objects
│       ├── entity/           # JPA entities
│       ├── security/         # JWT filter, UserDetailsService
│       └── service/          # Business logic
├── frontend/                 # React application
│   └── src/
│       ├── api/              # Axios API clients
│       ├── components/       # Reusable UI components
│       ├── context/          # AuthContext (JWT state)
│       └── pages/            # Route pages per module
├── docker-compose.yml
└── .env.example
```

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/dashboard` | Dashboard metrics |
| GET/POST | `/api/employees` | Employee management |
| GET/POST | `/api/visits` | OPD visit management |
| POST | `/api/visits/{id}/prescription` | Add prescription |
| POST | `/api/visits/{id}/dispense` | Dispense medicines |
| GET/POST | `/api/medicines` | Medicine CRUD |
| POST | `/api/medicines/transaction` | Stock transaction |
| GET/POST | `/api/vaccinations` | Vaccination records |
| GET | `/api/reports/opd` | OPD report |
| GET/POST | `/api/users` | User management (Admin) |
