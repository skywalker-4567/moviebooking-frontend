<div align="center">

# 🎬 CineBook — Movie Ticket Booking System

A full-stack movie ticket booking web application built as a college project.
Browse movies, select seats, book tickets, order food, and write reviews.

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**[🌐 Live Demo](https://moviebooking-frontend-sepia.vercel.app)** · **[📖 API Docs](https://moviebooking-production-56bd.up.railway.app/swagger-ui/index.html)** · **[🖥 Backend Repo](https://github.com/skywalker-4567/moviebooking)** · **[💻 Frontend Repo](https://github.com/skywalker-4567/moviebooking-frontend)**

</div>

---

## 📸 Screenshots

> _Add screenshots here_

---

## ✨ Features

### Customer
- 🎥 Browse and search movies with genre filter and pagination
- 🎞 Movie detail page with showtimes by date and reviews
- 💺 Interactive seat map with **10-minute hold timer** (Redis TTL)
- 💳 Razorpay payment integration (test mode)
- 🍿 Food & drinks ordering per booking
- 📋 Booking history with CONFIRMED, COMPLETED, CANCELLED status
- ⭐ Review system — only users who watched the movie can review
- 📧 Email notifications on booking confirmation and cancellation

### Admin
- 🎬 Create and manage movies
- 📅 Create and manage shows

### Theatre Owner
- 🏛 Create and manage theatres
- 📺 Create screens per theatre
- 🪑 Bulk seat creation per screen

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS v3, React Router DOM, Axios |
| **Backend** | Java 21, Spring Boot 3.5, Spring Security, JWT |
| **Database** | PostgreSQL |
| **Cache** | Redis (seat hold with 10-min TTL) |
| **Payment** | Razorpay (test mode) |
| **Docs** | Swagger UI / OpenAPI |
| **Deployment** | Railway (backend + PostgreSQL + Redis), Vercel (frontend) |

---

## 🏗 Architecture

```
┌─────────────────────┐         ┌──────────────────────────────┐
│   React Frontend    │──HTTP──▶│      Spring Boot API          │
│  (Vercel)           │◀────────│      (Railway)                │
└─────────────────────┘         │                              │
                                │  ┌──────────┐  ┌─────────┐  │
                                │  │PostgreSQL│  │  Redis  │  │
                                │  │(Railway) │  │(Railway)│  │
                                │  └──────────┘  └─────────┘  │
                                └──────────────────────────────┘
```

**Concurrency model — double booking prevention:**
- **Layer 1 (Redis):** `SET NX EX` atomic operation. First user holds the seat, second gets `409 Conflict` immediately — no DB hit.
- **Layer 2 (Optimistic Locking):** `@Version` on `ShowSeat` entity. If two requests race past Redis, JPA detects the version mismatch and rejects the second.

---

## 🚀 Getting Started

### Prerequisites
- Java 21
- Node.js 18+
- PostgreSQL
- Redis

### Backend

```bash
git clone https://github.com/skywalker-4567/moviebooking.git
cd moviebooking
```

Copy and configure environment variables:
```bash
cp application.yml.example src/main/resources/application.yml
# Fill in your DB, Redis, JWT, and mail credentials
```

Run:
```bash
mvn clean package -DskipTests
java -jar target/moviebooking.jar
# Runs on http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui/index.html
```

### Frontend

```bash
git clone https://github.com/skywalker-4567/moviebooking-frontend.git
cd moviebooking-frontend
npm install
```

Create `.env`:
```
VITE_API_BASE_URL=http://localhost:8080
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
```

Run:
```bash
npm run dev
# Runs on http://localhost:5173
```

### Docker (full stack)

```bash
git clone https://github.com/skywalker-4567/moviebooking.git
cd moviebooking
mvn clean package -DskipTests
docker-compose up
```

---

## ⚙️ Environment Variables

### Backend (`application.yml`)

| Variable | Description | Example |
|---|---|---|
| `DB_URL` | PostgreSQL connection URL | `jdbc:postgresql://localhost:5432/moviebooking` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `yourpassword` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your-256-bit-secret` |
| `MAIL_USERNAME` | Gmail address for notifications | `you@gmail.com` |
| `MAIL_PASSWORD` | Gmail App Password | `abcdefghijklmnop` |

### Frontend (`.env`)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL |
| `VITE_RAZORPAY_KEY_ID` | Razorpay test key ID |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |

**Login response:**
```json
{ "token": "eyJ...", "email": "user@test.com", "role": "CUSTOMER" }
```

### Movies
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/movies` | ADMIN | Create movie |
| GET | `/api/movies` | Public | List movies (paginated) |
| GET | `/api/movies/{id}` | Public | Get movie detail |

### Theatres & Screens
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/theatres` | THEATRE_OWNER | Create theatre |
| GET | `/api/theatres` | Public | List theatres |
| GET | `/api/theatres/my` | THEATRE_OWNER | My theatres |
| POST | `/api/screens` | THEATRE_OWNER | Create screen |
| GET | `/api/screens/theatre/{id}` | Public | Screens by theatre |
| POST | `/api/seats` | THEATRE_OWNER | Create seat |
| GET | `/api/seats/screen/{id}` | Public | Seats by screen |

### Shows & Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/shows` | ADMIN/OWNER | Create show |
| GET | `/api/shows/movie/{id}` | Public | Shows by movie |
| POST | `/api/bookings/hold` | CUSTOMER | Hold seats (10 min TTL) |
| POST | `/api/bookings/confirm` | CUSTOMER | Confirm booking |
| POST | `/api/bookings/{id}/cancel` | CUSTOMER | Cancel with refund |
| GET | `/api/bookings/my` | CUSTOMER | My bookings |

### Food & Reviews
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/food/menu/{theatreId}` | Public | Food menu |
| POST | `/api/food/order` | CUSTOMER | Place food order |
| POST | `/api/reviews` | CUSTOMER | Submit review |
| GET | `/api/reviews/movie/{id}` | Public | Movie reviews |

Full interactive docs: **[Swagger UI](https://moviebooking-production-56bd.up.railway.app/swagger-ui/index.html)**

---

## 📁 Project Structure

### Frontend
```
src/
├── api/              # Axios instance + all API call functions
├── context/          # AuthContext (global auth state)
├── pages/            # One file per page
│   ├── admin/        # Admin panel pages
│   └── owner/        # Theatre owner panel pages
└── components/       # Navbar, reusable UI components
```

### Backend
```
src/main/java/com/moviebooking/
├── config/           # Security, Redis, Swagger config
├── controller/       # REST controllers
├── dto/              # Request/Response DTOs
│   ├── request/
│   └── response/
├── entity/           # JPA entities (11 entities)
├── enums/            # Role, BookingStatus, PaymentStatus, SeatType
├── exception/        # Custom exceptions + GlobalExceptionHandler
├── repository/       # Spring Data JPA repositories
├── security/         # JWT filter, UserDetails
└── service/          # Business logic
```

---

## 🧪 Test Credentials

### App Users

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@test.com | password123 |
| THEATRE_OWNER | owner@test.com | password123 |
| CUSTOMER | customer@test.com | password123 |

### Razorpay Test Card

| Field | Value |
|---|---|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date |
| CVV | Any 3 digits |
| OTP | `1234` |

---

## ☁️ Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://moviebooking-frontend-sepia.vercel.app |
| Backend API | Railway | https://moviebooking-production-56bd.up.railway.app |
| PostgreSQL | Railway (managed) | — |
| Redis | Railway (managed) | — |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built by [skywalker-4567](https://github.com/skywalker-4567) · 3rd Year CS Student

</div>
