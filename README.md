# Auth System

A modern, full-stack authentication system built with NestJS (backend) and Next.js (frontend), featuring session-based authentication, multiple login methods, and advanced security features.

---

## Features

### Authentication Methods

- **Password Authentication** — Email/password with Argon2 hashing
- **OAuth 2.0** — Google and GitHub integration
- **Magic Links** — Passwordless authentication via email
- **Two-Factor Authentication (2FA)**
  - Email-based OTP
  - TOTP (Google Authenticator / any TOTP app)

### Security Features

- Session-based authentication (HttpOnly cookies)
- CSRF protection (Double Submit Cookie pattern with non-httpOnly CSRF token)
- Account lockout after 10 failed login attempts (30 min lockout)
- Sliding session expiry (15 days from last activity)
- Email verification for new accounts
- Password reset via OTP
- Account recovery (admin-initiated)
- SHA-256 hashed session tokens in DB (raw token only in cookie)
- Argon2 password hashing
- CORS configured for cross-origin cookie support

### User Features

- Session listing with device/IP tracking
- Individual session revocation
- Change password (with session logout options)
- Change email (with identity verification)
- 2FA setup and disable
- Magic link login

### Admin Features

- Paginated, searchable user list
- Promote/demote user roles
- Force logout any user
- Delete user
- Send admin-initiated account recovery link

---

## Tech Stack

### Backend

- **Framework**: NestJS
- **Database**: PostgreSQL (Docker) with Prisma ORM
- **Authentication**: Passport.js (Google, GitHub strategies)
- **Password Hashing**: Argon2
- **OTP/TOTP**: otplib
- **Email**: Nodemailer (Gmail SMTP)
- **Validation**: class-validator + class-transformer
- **Scheduling**: @nestjs/schedule (cron jobs)

### Frontend

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form
- **Validation**: Zod
- **Data Fetching**: TanStack Query (React Query)
- **HTTP Client**: Axios

---

## Project Structure

```
auth-system/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   │   ├── decorators/
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   ├── strategies/
│   │   │   ├── types/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── cleanup.service.ts
│   │   │   ├── otp.service.ts
│   │   │   └── session.service.ts
│   │   ├── mail/
│   │   │   ├── mail.module.ts
│   │   │   └── mail.service.ts
│   │   ├── users/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.module.ts
│   │   │   └── users.service.ts
│   │   ├── prisma/
│   │   ├── lib/
│   │   ├── logger/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   └── docker-compose.yaml
│
├── frontend/
│    └── src/
│        ├── app/
│        │   ├── (auth)/
│        │   ├── (protected)/
│        │   └── (admin)/
│        ├── components/
│        ├── hooks/
│        ├── providers/
│        ├── services/
│        ├── store/
│        └── lib/
│
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- Docker Engine/Docker Desktop
- pnpm
- Gmail account with App Password enabled

### Environment Variables

#### Backend (`backend/.env`)

```env
PORT=8000
DATABASE_URL="postgresql://postgres:password@localhost:5432/db"

FRONTEND_URL="http://localhost:3005"

MAIL_USER="your_gmail@gmail.com"
MAIL_PASS="your_gmail_app_password"
SUPPORT_EMAIL="support@yourdomain.com"

GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_CALLBACK_URL="http://localhost:8000/api/auth/google/callback"

GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
GITHUB_CALLBACK_URL="http://localhost:8000/api/auth/github/callback"
```

> **Note**: `DATABASE_URL` credentials match the `docker-compose.yaml` defaults.
> `MAIL_PASS` is a Gmail App Password, not your Google account password.
> Generate one at: Google Account → Security → 2-Step Verification → App Passwords

#### Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_API_URL="http://localhost:8000/api"
```

### Installation

1. **Clone the repository**

```bash
https://github.com/coder-peris/auth-system.git
cd auth-system
```

2. **Start the database**

```bash
cd backend
docker-compose up -d
```

3. **Install backend dependencies**

```bash
pnpm install
```

4. **Run database migrations**

```bash
pnpm prisma migrate dev
pnpm prisma generate
```

5. **Install frontend dependencies**

```bash
cd ../frontend
pnpm install
```

6. **Start development servers**

```bash
# Backend (terminal 1)
cd backend
pnpm start:dev

# Frontend (terminal 2)
cd frontend
pnpm dev
```

The application will be available at:

- Frontend: `http://localhost:3005`
- Backend API: `http://localhost:8000/api`

---

## API Endpoints

All endpoints are prefixed with `/api`.

### Auth

| Method | Endpoint           | Auth | Description               |
| ------ | ------------------ | ---- | ------------------------- |
| POST   | `/auth/register`   | No   | Register new user         |
| POST   | `/auth/login`      | No   | Login with email/password |
| POST   | `/auth/logout`     | Yes  | Logout current session    |
| POST   | `/auth/logout-all` | Yes  | Logout all sessions       |
| GET    | `/auth/me`         | Yes  | Get current user          |

### Email Verification

| Method | Endpoint                    | Auth | Description             |
| ------ | --------------------------- | ---- | ----------------------- |
| POST   | `/auth/verify-email`        | No   | Verify email with OTP   |
| POST   | `/auth/resend-verification` | No   | Resend verification OTP |

### Password Management

| Method | Endpoint                | Auth | Description                |
| ------ | ----------------------- | ---- | -------------------------- |
| POST   | `/auth/forgot-password` | No   | Request password reset OTP |
| POST   | `/auth/reset-password`  | No   | Reset password with OTP    |
| POST   | `/auth/change-password` | Yes  | Change password            |

### Email Management

| Method | Endpoint                     | Auth | Description                                |
| ------ | ---------------------------- | ---- | ------------------------------------------ |
| POST   | `/auth/change-email/request` | Yes  | Send OTP to current email (verified users) |
| PATCH  | `/auth/change-email`         | Yes  | Change email                               |

### Magic Link

| Method | Endpoint                  | Auth | Description             |
| ------ | ------------------------- | ---- | ----------------------- |
| POST   | `/auth/magic-link`        | No   | Request magic link      |
| POST   | `/auth/magic-link/verify` | No   | Verify magic link token |

### Sessions

| Method | Endpoint             | Auth | Description              |
| ------ | -------------------- | ---- | ------------------------ |
| GET    | `/auth/sessions`     | Yes  | List all active sessions |
| DELETE | `/auth/sessions/:id` | Yes  | Revoke specific session  |

### 2FA — Email

| Method | Endpoint                  | Auth | Description                  |
| ------ | ------------------------- | ---- | ---------------------------- |
| POST   | `/auth/2fa/email/setup`   | Yes  | Setup email 2FA              |
| POST   | `/auth/2fa/email/confirm` | Yes  | Confirm email 2FA setup      |
| POST   | `/auth/2fa/email/verify`  | No   | Verify email OTP after login |
| POST   | `/auth/2fa/disable`       | Yes  | Disable 2FA                  |

### 2FA — TOTP

| Method | Endpoint                 | Auth | Description                     |
| ------ | ------------------------ | ---- | ------------------------------- |
| POST   | `/auth/2fa/totp/setup`   | Yes  | Generate TOTP secret and QR URI |
| POST   | `/auth/2fa/totp/confirm` | Yes  | Confirm TOTP setup              |
| POST   | `/auth/2fa/totp/verify`  | No   | Verify TOTP code after login    |

### OAuth 2.0

| Method | Endpoint                | Auth | Description           |
| ------ | ----------------------- | ---- | --------------------- |
| GET    | `/auth/google`          | No   | Initiate Google OAuth |
| GET    | `/auth/google/callback` | No   | Google OAuth callback |
| GET    | `/auth/github`          | No   | Initiate GitHub OAuth |
| GET    | `/auth/github/callback` | No   | GitHub OAuth callback |

### Account Recovery

| Method | Endpoint                 | Auth | Description                             |
| ------ | ------------------------ | ---- | --------------------------------------- |
| POST   | `/auth/account-recovery` | No   | Recover account with admin-issued token |

### Support

| Method | Endpoint   | Auth | Description          |
| ------ | ---------- | ---- | -------------------- |
| POST   | `/support` | No   | Contact support team |

### Admin — User Management

| Method | Endpoint                         | Auth  | Description                     |
| ------ | -------------------------------- | ----- | ------------------------------- |
| GET    | `/users?page=1&limit=10&search=` | Admin | Paginated, searchable user list |
| DELETE | `/users/:id`                     | Admin | Delete user                     |
| PATCH  | `/users/:id/role`                | Admin | Update user role                |
| DELETE | `/users/:id/sessions`            | Admin | Force logout user               |
| POST   | `/users/:id/recovery-link`       | Admin | Send account recovery link      |

---

## Database Schema

### Models

- **User** — Core user info, role, 2FA settings, lockout fields
- **UserProvider** — Links users to OAuth providers (Google, GitHub)
- **Session** — Active sessions with IP, user agent, last active tracking
- **OtpToken** — Single-use tokens for email verification, password reset, magic link, 2FA, account recovery

### OTP Token Types

- `EMAIL_VERIFICATION`
- `PASSWORD_RESET`
- `MAGIC_LINK`
- `TWO_FACTOR`
- `ACCOUNT_RECOVERY`

---

## Available Scripts

### Backend

```bash
pnpm start:dev        # Start development server with hot reload
pnpm build            # Build for production
pnpm start:prod       # Start production server
pnpm lint             # Run ESLint
```

### Frontend

```bash
pnpm dev              # Start development server on port 3005
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
```

---

## License

UNLICENSED
