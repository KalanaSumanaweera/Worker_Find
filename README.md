# Artisans Lanka — Artisan Marketplace

Artisans Lanka is a premium, two-sided marketplace designed to connect skilled Sri Lankan artisans (Providers) with service seekers (Seekers). The platform features high-fidelity glassmorphic design, robust role-based authentication, and a centralized administrative moderation workflow.

![Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## 🚀 Features

### For Service Seekers
- **Find Skilled Artisans**: Browse a curated directory of professionals with ratings and reviews.
- **Post Needs**: Create job requests detailing the required service, location, and budget.
- **Track Responses**: View professional proposals from artisans directly in your dashboard.

### For Professional Artisans
- **Create a Profile**: Showcase your services, experience, and pricing.
- **Job Feed**: Browse live job leads from seekers and submit professional responses.
- **Lead Management**: Track all contact inquiries and responses in one place.

### For Administrators
- **Moderation Workflow**: Approve or reject worker profiles and job posts before they go live.
- **Analytics**: High-level overview of users, active posts, and platform growth.
- **User Management**: Manage account statuses to ensure platform safety.

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS (V4), Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express, Passport.js (Google OAuth).
- **Database**: PostgreSQL (Hosted on Neon DB).
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing.

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- A Neon DB PostgreSQL instance (or any PostgreSQL DB)
- Google Cloud Console Project (for OAuth)

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory based on `.env.example`:
```env
DATABASE_URL="your_postgresql_url"
JWT_SECRET="your_secret"
GOOGLE_CLIENT_ID="your_google_id"
GOOGLE_CLIENT_SECRET="your_google_secret"
CALLBACK_URL="http://localhost:3003/api/auth/google/callback"
CLIENT_URL="http://localhost:3000"
```

### 3. Database Migration
Run the migration script to set up the schema:
```bash
npx tsx server/migrate-v4.ts
```

### 4. Running the Project
Open two terminals:

**Terminal 1 (Frontend):**
```bash
npm run dev
```

**Terminal 2 (Backend):**
```bash
npm run server
```

## 📜 License
SPDX-License-Identifier: Apache-2.0
