# 🎬 The IMovies — Cinema Ticket Reservation Platform

A full-stack, enterprise-grade online movie ticket booking platform built with **Express.js, MongoDB, React.js, and Bootstrap 5**.

The IMovies replicates modern cinema booking platforms like AMC, Cineplex, and BookMyShow, featuring interactive seat selection with tiered pricing, real-time seat locking to prevent double-bookings, coupon discount validation, digital QR-code ticket issuance, and comprehensive administrative analytics.

---
[![Watch the Video](https://raw.githubusercontent.com/arnavdadaryagupta-web/imovies/main/thumbnail.jpg)](https://github.com/arnavdadaryagupta-web/imovies/blob/main/imovie%20video.mp4)

---
## 🚀 Key Features

- **Dynamic Movie Catalogue**: Browse Now Showing and Upcoming movies, filter by genre and language, search with instant autocomplete.
- **Rich Movie Showcases**: Watch embedded official trailers, browse actor/crew details, and review synopses and ratings.
- **Showtime & Multiplex Scheduling**: View shows across multiple cinema locations, formats (IMAX 3D, 4DX, 2D Dolby Atmos), and dates.
- **Interactive Theater Seat Matrix**:
  - Visual curved cinema screen representation
  - Multi-tier seat layout (VIP Recliner, Premium, Standard)
  - Real-time seat locking and visual availability indicators (Available, Selected, Sold Out)
- **Smart Checkout & Coupons**:
  - Automatic pricing calculation (Subtotal + Convenience Fee - Promo Discount)
  - Live coupon codes: `MOVIEPASS` (15% off) and `IMOVIES50` (₹50 off)
  - Simulated payment modes: UPI / QR, Credit/Debit Card, Net Banking
- **Digital E-Ticket Issuance**:
  - Live scannable QR Code dynamically generated via `qrcode`
  - Printable cinema ticket stub with animated confetti celebration
- **My Bookings & Self-Service Cancellation**:
  - Full booking history with status badges
  - One-click ticket cancellation with instant seat inventory restoration
- **Admin Management Portal**:
  - Live revenue analytics, tickets sold counter, and customer metrics
  - Add new movies and configure showtimes across halls

---

## 🛠️ Architecture & Skills Required

| Technology | Purpose |
| :--- | :--- |
| **HTML5 & CSS3** | Modern semantic structure, glassmorphism UI, cinema dark theme |
| **JavaScript (ES6+)** | Asynchronous operations, async/await, DOM interaction |
| **React.js 18** | Reactive single-page application (SPA), Hooks, Context API |
| **Bootstrap 5 & Icons** | Responsive grid system, modals, carousels, cards, and UI components |
| **Node.js & Express.js** | High-performance RESTful API server, middleware pipeline |
| **MongoDB & Mongoose** | NoSQL document storage, schemas, references, validation |
| **JSON Web Token (JWT)** | Stateless authentication and role-based access control (User/Admin) |
| **Bcrypt.js** | Salted password encryption and verification |

---

## 📂 Project Structure

```text
imovies/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database connection & fallback handler
│   ├── controllers/
│   │   ├── authController.js     # User registration, login, and profile
│   │   ├── movieController.js    # Movie CRUD operations & search filters
│   │   ├── showtimeController.js # Hall showtimes & seat matrix generation
│   │   ├── bookingController.js  # Atomic seat booking, cancellation, promo
│   │   └── adminController.js    # Box office statistics & analytics
│   ├── data/
│   │   ├── seedData.js           # Realistic cinema catalog seed data
│   │   └── local_db.json         # High-availability persistent JSON storage
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & Admin guards
│   │   └── errorMiddleware.js    # 404 & centralized error handler
│   ├── models/
│   │   ├── User.js               # User accounts & roles
│   │   ├── Movie.js              # Movies, trailers, ratings, & genres
│   │   ├── Theater.js            # Multiplexes, screens, & facilities
│   │   ├── Showtime.js           # Screenings, formats, & reserved seats
│   │   └── Booking.js            # Invoices, ticket stubs, & QR payloads
│   ├── routes/                   # Express REST route endpoints
│   ├── seed.js                   # Database initialization script
│   ├── server.js                 # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar with search & city selector
│   │   │   ├── Footer.jsx        # Cinema footer & promo codes
│   │   │   ├── MovieCard.jsx     # Movie display card with hover animation
│   │   │   ├── SeatMatrix.jsx    # Interactive theater seat picker
│   │   │   ├── TicketModal.jsx   # Digital ticket stub with QR code
│   │   │   └── TrailerModal.jsx  # Embedded YouTube player modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global JWT authentication state
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Hero carousel & movie grid
│   │   │   ├── MovieDetailsPage.jsx # Synopsis, cast, dates & showtimes
│   │   │   ├── BookingPage.jsx   # Seat selection & checkout
│   │   │   ├── MyBookingsPage.jsx # User booking history & cancel
│   │   │   ├── LoginPage.jsx     # User/Admin login + 1-click demo login
│   │   │   ├── RegisterPage.jsx  # New patron registration
│   │   │   └── AdminDashboardPage.jsx # Analytics & show management
│   │   ├── services/
│   │   │   └── api.js            # Centralized API service layer
│   │   ├── App.jsx               # React Router routes
│   │   ├── index.css             # Cinema dark styling & custom scrollbars
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── start.bat                     # 1-Click Windows Launcher
├── start.ps1                     # PowerShell Launcher
├── package.json                  # Root orchestration
└── README.md
```

---

## 📋 Epics and Tasks Breakdown (6 Epics • 19 Tasks)

### Epic 1: System Setup & Architecture
- **Task 1**: Initialize Node.js/Express backend environment and React.js frontend with Vite and Bootstrap 5.
- **Task 2**: Establish database connection with dual-mode support (MongoDB Atlas / local MongoDB + seamless offline JSON persistence).
- **Task 3**: Create centralized RESTful API proxy and cross-origin resource sharing (CORS) setup.

### Epic 2: User Authentication & Role Management
- **Task 4**: Create User Mongoose schema with Bcrypt password hashing hooks.
- **Task 5**: Implement JWT token generation and validation middleware (`protect`, `adminOnly`).
- **Task 6**: Build User Registration and Login endpoints with input validation.
- **Task 7**: Develop React Authentication Context with token persistence in `localStorage` and 1-click test credentials.

### Epic 3: Movie & Cinema Discovery
- **Task 8**: Design Movie and Theater schemas with genres, duration, age classification, and media assets.
- **Task 9**: Build Movie browsing APIs with query filtering (genre, language, status, search keyword).
- **Task 10**: Create responsive Home Page with Hero Carousel, Now Showing/Upcoming tabs, and Movie Cards.
- **Task 11**: Build Movie Details page with cast cards, YouTube trailer modal, and theater date picker.

### Epic 4: Showtime Scheduling & Interactive Seat Reservation
- **Task 12**: Design Showtime schema tracking dates, start times, formats (IMAX 3D, 4DX), and booked seat arrays.
- **Task 13**: Develop interactive Seat Matrix component (`SeatMatrix.jsx`) with realistic curved cinema screen, multi-tier pricing (VIP, Premium, Standard), and live selection.
- **Task 14**: Implement atomic seat collision verification to prevent simultaneous seat double-booking.

### Epic 5: Checkout, Promo Codes & Digital E-Tickets
- **Task 15**: Implement dynamic checkout computation with convenience fees and coupon codes (`MOVIEPASS`, `IMOVIES50`).
- **Task 16**: Build Booking creation API with unique booking confirmation IDs (`IMV-YYYY-XXXX`).
- **Task 17**: Develop Digital Ticket component (`TicketModal.jsx`) featuring scannable QR Code generation (`qrcode`), confetti celebration (`canvas-confetti`), and printable ticket stubs.

### Epic 6: Booking Management & Admin Console
- **Task 18**: Build My Bookings page allowing patrons to view their ticket history and cancel bookings with automated seat release.
- **Task 19**: Create Admin Dashboard displaying box office metrics (revenue, tickets sold), movie management (add/delete), and showtime scheduling.

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v16 or above (v18+ recommended)
- **npm**: v8 or above
- **MongoDB** *(Optional)*: Local service `mongodb://127.0.0.1:27017` or MongoDB Atlas URI in `backend/.env`. If MongoDB is not installed, the application automatically uses the built-in local JSON storage engine.

### 2. Running with 1-Click Launchers
Double click **`start.bat`** (or execute `./start.ps1` in PowerShell). This launches both the Backend API server (Port 5000) and the Frontend Vite client (Port 5173) in separate windows.

### 3. Manual Launch

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server will run at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Client will run at http://localhost:5173
```

---

## 🔑 Default Test Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@imovies.com` | `admin123` | Full access: Add movies, schedule shows, view revenue |
| **User** | `john@example.com` | `password123` | Browse, select seats, book tickets, cancel reservations |

*(Tip: The Sign In page includes 1-click **"Demo User"** and **"Demo Admin"** buttons for instant testing!)*

---

## 🎟️ Active Promo Codes

- **`MOVIEPASS`** — 15% discount on tickets (up to ₹150)
- **`IMOVIES50`** — Flat ₹50 instant discount
- **`BLOCKBUSTER`** — 20% discount on tickets (up to ₹200)

---

## 📡 RESTful API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new patron account
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/profile` — Fetch current user profile *(Private)*

### Movies (`/api/movies`)
- `GET /api/movies` — List movies (filters: `genre`, `language`, `status`, `search`)
- `GET /api/movies/:id` — Get movie details
- `POST /api/movies` — Add movie *(Admin)*
- `PUT /api/movies/:id` — Update movie *(Admin)*
- `DELETE /api/movies/:id` — Delete movie *(Admin)*

### Showtimes & Theaters (`/api/showtimes`)
- `GET /api/showtimes/theaters` — List all cinema venues
- `GET /api/showtimes/movie/:movieId?date=YYYY-MM-DD` — Showtimes for a movie
- `GET /api/showtimes/:id` — Showtime seat matrix with reserved seat indicators
- `POST /api/showtimes` — Schedule a new screening *(Admin)*

### Bookings (`/api/bookings`)
- `POST /api/bookings` — Atomically reserve seats & book tickets *(Private)*
- `GET /api/bookings/my` — Fetch user's booking history *(Private)*
- `GET /api/bookings/:id` — Fetch specific ticket details *(Private)*
- `PUT /api/bookings/:id/cancel` — Cancel booking & release seats *(Private)*
- `POST /api/bookings/promo` — Validate coupon discount

### Admin Analytics (`/api/admin`)
- `GET /api/admin/stats` — Revenue, tickets sold, and recent audits *(Admin)*
