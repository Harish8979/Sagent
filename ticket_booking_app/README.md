# PulseSeats

Full-stack seat booking application built with:

- Spring Boot 3, Spring Data JPA, Spring Security JWT, STOMP WebSockets, Maven
- React, Vite, Tailwind CSS, Lucide React, React Query, `@stomp/stompjs`
- MySQL for persistent data

## Project Structure

- `backend/` Spring Boot API and realtime seat sync server
- `frontend/` React client

## Backend Setup

1. Create a local MySQL server and update credentials in `backend/src/main/resources/application.properties` if needed.
2. Default database URL:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ticket_booking_app?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root123
```

You can also override these at runtime:

```bash
DB_URL=jdbc:mysql://127.0.0.1:3307/ticket_booking_app?createDatabaseIfNotExist=true\&useSSL=false\&allowPublicKeyRetrieval=true\&serverTimezone=UTC
DB_USERNAME=ticket_user
DB_PASSWORD=ticket_pass
APP_CORS_ALLOWED_ORIGIN=http://localhost:5173
```

3. Run the backend:

```bash
cd backend
mvn spring-boot:run
```

### Backend Features

- OTP login via email or mobile with JWT
- MySQL-backed entities for users, movies, theaters, showtimes, seats, bookings, and OTP verifications
- Seat statuses: `AVAILABLE`, `SELECTED`, `BOOKED`
- WebSocket topic broadcasts at `/topic/showtimes/{showtimeId}/seats`
- Razorpay payment stub for order creation and capture
- Sample discovery data seeded automatically when the database is empty

## Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Optional environment variables:

```bash
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws-seat-updates
```

## Key User Flows

- Discovery homepage with featured movie carousel and filterable upcoming showtimes
- OTP login from the header
- Interactive seat map with live cross-client sync
- Review page with server-generated quote and Razorpay stub order id
- My Bookings page for current and past tickets

## Build Verification

```bash
cd backend && mvn -q -DskipTests package
cd frontend && npm run build
```
