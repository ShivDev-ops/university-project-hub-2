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
university-project-hub/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts   # NextAuth handler
│   │   ├── send-otp/route.ts             # Send OTP email
│   │   ├── verify-otp/route.ts           # Verify OTP code
│   │   └── user/
│   │       └── profile/route.ts          # Save profile setup
│   ├── auth/error/page.tsx               # Auth error page
│   ├── login/page.tsx                    # Login page
│   ├── verify/page.tsx                   # OTP verification page
│   ├── onboarding/page.tsx               # Onboarding page
│   ├── profile/setup/page.tsx            # Profile setup page
│   ├── dashboard/page.tsx                # Main dashboard
│   ├── suspended/page.tsx                # Suspended account page
│   ├── layout.tsx                        # Root layout + SessionProvider
│   └── page.tsx                          # Public landing page
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser Supabase client
│   │   ├── server.ts                     # Server Supabase client (SSR)
│   │   └── admin.ts                      # Admin client (bypasses RLS)
│   ├── auth.ts                           # NextAuth config + callbacks
│   └── otp.ts                            # OTP helpers
├── components/
│   ├── SessionProviderWrapper.tsx         # NextAuth session provider
│   └── LandingClient.tsx                 # Landing page client component
├── hooks/
│   └── useFingerprint.ts                 # FingerprintJS hook
├── types/
│   └── next-auth.d.ts                    # NextAuth type extensions
└── proxy.ts                              # Route protection middleware
```

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

## 🔄 Authentication Flow

```
User clicks "Continue with Microsoft"
          ↓
Azure AD OAuth → Microsoft login page
          ↓
NextAuth signIn callback runs
          ↓
Email domain check (@lpu.in only)
          ↓
First login? → Create profile row in Supabase
          ↓
Generate 6-digit OTP → Store in otp_codes table
          ↓
Send OTP via Resend email
          ↓
Redirect to /verify page
          ↓
User enters OTP code
          ↓
OTP verified → verified: true saved in DB
          ↓
Session refreshed via update()
          ↓
Redirect to /profile/setup
          ↓
User fills bio, skills, GitHub URL
          ↓
profile_complete: true saved in DB
          ↓
Redirect to /dashboard ✅
```

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