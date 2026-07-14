#  Ticket Booking System

A scalable ticket booking platform for movies, concerts, and live events with real-time seat selection, role-based access control, seat management, and secure booking workflows.

##  Features

### Authentication & Authorization
- JWT-based Authentication
- Role-Based Access Control (RBAC)
- Admin, Organiser, and Customer roles
- Protected APIs

### Venue Management
- Create and manage venues
- Define seat categories (VIP, Premium, Standard, Economy)
- Configure venue seating layouts

### Event & Show Management
- Create events and shows
- Associate events with venues
- Manage show timings and availability

### Seat Management
- Automatic seat generation
- Row-wise seat allocation
- Seat category mapping
- Visual seat organization

### Booking System
- Real-time seat booking
- Booking history
- Booking status tracking
- Prevent duplicate seat bookings
- Seat locking mechanism
- Redis-based temporary reservations
- Waitlist system
- Payment gateway integration
- QR Code ticket generation
- Email notifications
- Real-time seat updates using WebSockets

---

##  System Architecture

Customer → API → Authentication → Business Logic → PostgreSQL Database

```text
Customer
    │
    ▼
 Express API
    │
    ▼
 Authentication Layer
    │
    ▼
 Business Services
    │
    ▼
 PostgreSQL
```

---

##  Tech Stack

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL (Supabase)

### Authentication
- JWT (JSON Web Tokens)
- bcrypt

### Validation
- Zod

### Development Tools
- Nodemon
- Postman

---

##  Project Structure

```text
src
│
├── config
│   ├── db.js
│
├── controllers
│
├── services
│
├── routes
│
├── middlewares
│
├── validations
│
└── server.js
```

---

##  Database Design

### User Roles

- ADMIN
- ORGANISER
- CUSTOMER

### Core Entities

- Users
- Venues
- Seat Categories
- Seats
- Events
- Shows
- Bookings
- Tickets
- Payments
- Waitlists

### Database ER Diagram
(supabase-schema-xwdgdlrpieqrftoqxizz.png)
---

##  Authentication Flow

1. User registers
2. User logs in
3. JWT token generated
4. Token sent in Authorization header
5. Protected APIs verify token before processing requests

Example:

```http
Authorization: Bearer <jwt_token>
```

---

##  Sample APIs

### Authentication

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Venue

```http
POST /api/v1/venues/create
```

### Seat Category

```http
POST /api/v1/seat-categories/create
```

### Seat Layout

```http
POST /api/v1/seats/create
```

---

##  Key Engineering Challenges

### Concurrent Seat Booking

Multiple users may attempt to book the same seat simultaneously.

Planned solution:

- Database Transactions
- Row-Level Locking
- Seat Hold Mechanism
- Redis-based Temporary Reservations

### Scalability

Designed with a layered architecture:

- Controller Layer
- Service Layer
- Database Layer

to support future scaling and maintainability.

---

##  Running Locally

### Clone Repository

```bash
git clone <repo-url>
cd ticket-booking-system-backend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create `.env`

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_secret
JWT_EXPIRES_IN=7d
PORT=5000
```

### Start Development Server

```bash
npm run dev
```

---

## Learning Outcomes

This project demonstrates:

- Backend System Design
- REST API Development
- PostgreSQL Database Design
- Authentication & Authorization
- Role-Based Access Control
- Scalable Application Architecture
- Real-world Ticket Booking Workflows

---

## Author

**Rishita Galande**

Computer Engineering Student | Backend Developer | 