# University Project Hub

A full-stack web application that helps B.Tech students find teammates for university projects. Built with Next.js 16, Supabase, Azure AD authentication, and AI-powered matching.

---

## 🚀 Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16.2.3 | Framework (App Router) |
| NextAuth v4 | Authentication |
| Azure AD | Microsoft OAuth Provider |
| Supabase | Database + Storage |
| Resend | Transactional Email |
| Netlify | Deployment |
| Tailwind CSS v4 | Styling |
| TypeScript | Language |
| FingerprintJS | Device Fingerprinting |

---

## ✅ Completed Phases

### Phase 1 — Foundation
- Next.js 16 project initialized with App Router + Tailwind CSS
- Environment variables configured (Azure AD, Supabase, Resend)
- Deployed to Netlify with `@netlify/plugin-nextjs`
- GitHub repository connected with auto-deploy on push

### Phase 2 — Authentication + Database

#### Microsoft OAuth (Azure AD)
- Multi-tenant Azure app registration configured
- Microsoft OAuth flow working via NextAuth v4
- University email domain validation (`@lpu.in`)
- Redirect URIs configured for both localhost and Netlify

#### Hybrid OTP Verification
- 6-digit OTP generated on every new login
- OTP stored in Supabase `otp_codes` table with 10-minute expiry
- OTP sent via Resend email API
- OTP marked as `used: true` after successful verification
- User `verified` flag updated in `profiles` table after OTP confirmation

#### Device Fingerprinting
- FingerprintJS free tier integrated via custom hook
- Device fingerprint stored in `profiles` table on signup
- Used for fraud detection in future phases

#### Route Protection (proxy.ts)
- Next.js 16 middleware (`proxy.ts`) protecting all private routes
- Unverified users → redirected to `/verify`
- Verified but incomplete profile → redirected to `/onboarding`
- Suspended users → redirected to `/suspended`
- Admin routes → protected with `is_admin` check

---

## 📁 Project Structure

```
university-project-hub2/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts       # Main NextAuth handler & logic
│   │   │   ├── check-username/route.ts      # Username availability endpoint
│   │   │   ├── error/page.tsx               # Auth error boundaries
│   │   │   ├── forgot-password/route.ts     # Send OTP for password reset
│   │   │   ├── reset-password/route.ts      # Update password securely
│   │   │   ├── save-credentials/route.ts    # Commit new username/password 
│   │   │   └── verify-reset-otp/route.ts    # Validate OTP for reset flow
│   │   ├── send-otp/route.tsx               # Standard verification OTP dispatcher
│   │   ├── user/
│   │   │   ├── export/                      # User data export hook
│   │   │   └── profile/route.ts             # Profile update/submit handler
│   │   └── verify-otp/route.ts              # General OTP validator
│   ├── dashboard/page.tsx                   # Main protected application view
│   ├── forgot-password/page.tsx             # Forgot password UI
│   ├── login/page.tsx                       # Login UI
│   ├── onboarding/page.tsx                  # Pre-requisite info splash
│   ├── profile/setup/page.tsx               # Profile creation wizard UI
│   ├── register/page.tsx                    # Registration UI
│   ├── set-credentials/page.tsx             # Post-OAuth credential setup UI

---

## 🗄️ Database Schema

Run these in **Supabase → SQL Editor**:

```sql
-- Profiles table
create table profiles (
  id               uuid default gen_random_uuid() primary key,
  user_id          uuid unique not null,
  email            text unique not null,
  full_name        text,
  bio              text,
  skills           text[] default '{}',
  github_url       text,
  fingerprint      text,
  avatar_url       text,
  verified         boolean default false,
  profile_complete boolean default false,
  is_admin         boolean default false,
  is_suspended     boolean default false,
  score            integer default 500,
  updated_at       timestamptz default now(),
  created_at       timestamptz default now()
);

-- OTP codes table
create table otp_codes (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid unique not null,
  code       text not null,
  expires_at timestamptz not null,
  used       boolean default false,
  created_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table otp_codes enable row level security;

create policy "Users can view own profile"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (true);

create policy "Users can insert own profile"
  on profiles for insert with check (true);

create policy "Users can access own OTP"
  on otp_codes for all using (true);
```

---

## 🔐 Environment Variables

Create `.env.local` at project root:

```env
# Azure AD
AZURE_AD_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_AD_CLIENT_SECRET=your-client-secret-value
AZURE_AD_TENANT_ID=common

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
```

---

## ⚙️ Installation & Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/university-project-hub.git
cd university-project-hub

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your values in .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔑 Azure AD Setup

1. Go to **Azure Portal → App Registrations → New Registration**
2. Set name and supported account types to **Multitenant**
3. Add Redirect URIs under **Authentication**:
   ```
   http://localhost:3000/api/auth/callback/azure-ad
   https://your-app.netlify.app/api/auth/callback/azure-ad
   ```
4. Go to **Certificates & Secrets → New Client Secret**
5. Copy the **Value** (not the Secret ID) → paste into `AZURE_AD_CLIENT_SECRET`
6. Go to **API Permissions → Add → Microsoft Graph → Delegated → User.Read**
7. Click **Grant Admin Consent**

---

## 📧 Resend Email Setup

1. Sign up at [resend.com](https://resend.com)
2. Go to **API Keys → Create API Key**
3. Copy key → paste into `RESEND_API_KEY`
4. For testing: use `onboarding@resend.dev` as `RESEND_FROM_EMAIL`
5. For production: add and verify your own domain in Resend dashboard

---

## 🌐 Netlify Deployment

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**
3. Connect your GitHub repository
4. Add all environment variables in **Netlify → Site → Environment Variables**
5. Set `NEXTAUTH_URL` to `https://your-app.netlify.app`
6. Click **Deploy** — Netlify auto-detects Next.js via `@netlify/plugin-nextjs`

---

## 🔄 Authentication & Onboarding Flow

Our application uses a hybrid authentication system supporting both **Email/Password** and **Microsoft OAuth (Azure AD)**. Both login methods converge into a unified onboarding pipeline to guarantee that every user is verified, completes their profile, and claims a platform username and password.

### 1️⃣ Core Login Pathways

#### Path A: Credentials (Email & Password)
1. **Login**: User enters their email and password on `/login`.
2. **Auth Check**: NextAuth verifies credentials against the `bcrypt` hash stored in the database.
3. **Session Created**: A secure JWT token is generated, containing the user's specific state (verified, profile completeness, admin status).

#### Path B: Microsoft OAuth (Azure AD)
1. **OAuth Redirect**: User clicks "Continue with Microsoft", navigating through the Azure AD sign-in page.
2. **Profile Lookup**: System checks for an existing user profile associated with their email.
3. **Account Creation**: If it's their first time, a new profile is created. They are then directed into the onboarding flow to set their username/password and verify their identity.

---

### 2️⃣ Route Protection & Interception (Middleware)

Once authenticated, our Next.js middleware (`proxy.ts`) strictly enforces the user sequence on every protected request. Users are automatically redirected to complete the first missing step in their profile setup:

- 🛑 **Suspended?** $\rightarrow$ Redirected to `/suspended` (Account locked)
- 📧 **Not Verified?** $\rightarrow$ Redirected to `/verify` (Must complete OTP challenge)
- 🔑 **Missing Credentials?** $\rightarrow$ Redirected to `/set-credentials` (OAuth users must claim a local username/password)
- 📝 **Incomplete Profile?** $\rightarrow$ Redirected to `/onboarding` or `/profile/setup`
- ✅ **All Clear?** $\rightarrow$ Granted full access to `/dashboard`

---

### 3️⃣ Verification Sub-Flows

#### 📧 OTP Verification (`/verify`)
- A **6-digit OTP** is generated and sent via **Resend**.
- User inputs the code; the system validates expiration (10 mins) and matches it.
- Database records `verified: true`, session refreshes, and the user advances.

#### 🔑 Credential Setup (`/set-credentials`)
- Mandatory step for OAuth users who lack a standard platform username and password.
- User selects a unique username (checked live via API) and sets a password.
- The hash is securely saved via backend insertion, allowing them to advance.

#### 🔄 Password Reset (`/forgot-password`)
- User enters an email to request a reset link.
- System hashes and emails a secure OTP instance.
- User submits the OTP alongside a new password.
- Database updates the hash, and the user is redirected to login.

---

## 🛡️ Route Protection Logic

`proxy.ts` (Next.js 16 middleware) runs on every protected route:

```
No token          → /login
is_suspended      → /suspended  
verified = false  → /verify
profile_complete  → /onboarding
is_admin = false  → blocked from /admin/*
```

---

## 🚧 Upcoming Phases

### Phase 3 — Project Feed
- Public landing feed (title + vacancy count only)
- Private dashboard feed (full details after login)
- Create/edit project pages
- Vault logic (GitHub + files revealed only after Accept)

### Phase 4 — AI Matching Engine
- OpenAI/Cohere embeddings stored in pgvector
- Cosine similarity search with skill weighting
- Natural language search bar on dashboard

### Phase 5 — Real-time + Notifications
- Supabase Realtime chat per project thread
- In-app notification bell
- Transactional emails for applications and accepts
- Accountability score system with PostgreSQL triggers

---

## 🤝 Contributing

This is a university project. For contributions or issues, open a pull request or raise an issue on GitHub.

---

## 📄 License

MIT License — feel free to use and modify.