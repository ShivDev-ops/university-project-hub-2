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
│   │   ├── admin/
│   │   │   ├── export/route.ts              # Admin data export endpoint
│   │   │   └── score/route.ts               # Update user score endpoint
│   │   ├── applications/
│   │   │   ├── route.ts                     # List/create applications
│   │   │   └── [id]/route.ts                # Get/update/delete application
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts       # Main NextAuth handler & OAuth logic
│   │   │   ├── check-username/route.ts      # Username availability endpoint
│   │   │   ├── forgot-password/route.ts     # Send password reset OTP
│   │   │   ├── reset-password/route.ts      # Update password with OTP
│   │   │   ├── save-credentials/route.ts    # Commit username/password for OAuth users
│   │   │   └── verify-reset-otp/route.ts    # Validate reset OTP
│   │   ├── notifications/
│   │   │   ├── route.ts                     # List/manage notifications
│   │   │   ├── unread-count/route.ts        # Get unread notification count
│   │   │   └── mark-read/route.ts           # Mark notification as read
│   │   ├── projects/
│   │   │   ├── route.ts                     # List/create projects
│   │   │   └── [id]/route.ts                # Get/update/delete project
│   │   ├── search/route.ts                  # Global search endpoint
│   │   ├── send-otp/route.tsx               # Send verification OTP
│   │   ├── skills/route.ts                  # List available skills
│   │   ├── upload/route.ts                  # File upload handler
│   │   ├── user/
│   │   │   ├── export/route.ts              # GDPR user data export
│   │   │   ├── profile/route.ts             # Get/update user profile
│   │   │   └── verify-email/route.ts        # Email verification endpoint
│   │   └── verify-otp/route.ts              # Validate verification OTP
│   ├── dashboard/page.tsx                   # Main protected dashboard
│   ├── forgot-password/page.tsx             # Password reset request UI
│   ├── login/page.tsx                       # Login page (credentials & OAuth)
│   ├── notifications/
│   │   ├── page.tsx                         # Notifications list page
│   │   ├── NotifActions.tsx                 # Accept/reject/profile actions
│   │   └── mark-read/route.ts               # Mark notification read handler
│   ├── onboarding/page.tsx                  # Profile onboarding splash
│   ├── profile/
│   │   ├── [userid]/page.tsx                # Public user profile view
│   │   ├── edit/page.tsx                    # Edit own profile page
│   │   └── setup/page.tsx                   # Profile creation wizard
│   ├── projects/
│   │   ├── page.tsx                         # Projects list/feed page
│   │   ├── create/page.tsx                  # Create new project page
│   │   └── [id]/
│   │       ├── page.tsx                     # Project detail view
│   │       ├── ApplySection.tsx             # Apply/manage applicants section
│   │       └── DeleteProjectControl.tsx     # Delete with name confirmation
│   ├── register/page.tsx                    # Registration page
│   ├── set-credentials/page.tsx             # Post-OAuth credential claim UI
│   ├── suspended/page.tsx                   # Account suspended notice
│   ├── verify/page.tsx                      # OTP verification page
│   ├── globals.css                          # Global styles
│   ├── layout.tsx                           # Root layout wrapper
│   └── page.tsx                             # Home/landing page
│
├── components/
│   ├── DashboardNavbar.tsx                  # Top navigation with unread badge
│   ├── DashboardProjectCard.tsx             # Dashboard project card
│   ├── DashboardSearchBar.tsx               # Search input for dashboard
│   ├── DashboardSidebar.tsx                 # Left sidebar with unread count
│   ├── LandingClient.tsx                    # Home page visual component
│   ├── MarkdownView.tsx                     # Markdown renderer
│   ├── ScoreBadge.tsx                       # Score display badge
│   ├── SearchBar.tsx                        # Global search component
│   ├── SessionProviderWrapper.tsx           # NextAuth session provider
│   ├── SkillSelector.tsx                    # Skill multi-select component
│   ├── SkillTag.tsx                         # Skill badge display
│   ├── dashboard/
│   │   ├── MyProjectsPanel.tsx              # User's created projects panel
│   │   └── SlotBanner.tsx                   # Project vacancy banner
│   ├── layout/
│   │   ├── Navbar.tsx                       # Navigation bar
│   │   └── Sidebar.tsx                      # Sidebar navigation
│   ├── Notifications/
│   │   ├── NotifBell.tsx                    # Bell icon with badge
│   │   └── NotifItem.tsx                    # Individual notification card
│   ├── profile/
│   │   ├── ProfileCard.tsx                  # User profile header card
│   │   └── ScoreHistory.tsx                 # Score history chart
│   ├── project/
│   │   ├── ApplyButton.tsx                  # Apply to project button
│   │   ├── ApplyModal.tsx                   # Application confirmation modal
│   │   ├── AppStatusBanner.tsx              # Application status display
│   │   ├── ProjectCard.tsx                  # Reusable project card
│   │   ├── TeamSection.tsx                  # Team members section
│   │   └── [id]/page.tsx                    # Project page wrapper
│   └── ui/
│       ├── Avatar.tsx                       # Avatar component
│       ├── Badge.tsx                        # Badge component
│       ├── Button.tsx                       # Button component
│       ├── Card.tsx                         # Card container
│       ├── EmptyState.tsx                   # Empty state placeholder
│       ├── Input.tsx                        # Text input component
│       ├── Modal.tsx                        # Modal dialog
│       ├── SkeletonCard.tsx                 # Skeleton loading state
│       ├── Spinner.tsx                      # Loading spinner
│       └── Toast.tsx                        # Toast notification
│
├── hooks/
│   └── useFingerprint.ts                    # Device fingerprinting hook
│
├── lib/
│   ├── auth.ts                              # Auth helpers
│   ├── otp.ts                               # OTP generation/validation
│   └── supabase/
│       ├── admin.ts                         # Supabase admin client
│       ├── client.ts                        # Supabase client (browser)
│       └── server.ts                        # Supabase server client
│
├── supabase/
│   └── migrations/
│       ├── 20260425_alter_profiles_add_missing_fields.sql
│       └── 20260425_create_notifications.sql
│
├── types/
│   ├── database.ts                          # Database type definitions
│   └── next-auth.d.ts                       # NextAuth type extensions
│
├── public/                                  # Static assets
│
├── AGENTS.md                                # Custom agent configuration
├── CLAUDE.md                                # Claude-specific instructions
├── eslint.config.mjs                        # ESLint configuration
├── middleware.ts                            # Next.js middleware (route protection)
├── netlify.toml                             # Netlify deployment config
├── next-env.d.ts                            # Next.js TypeScript definitions
├── next.config.ts                           # Next.js configuration
├── package.json                             # Dependencies
├── postcss.config.mjs                       # PostCSS configuration
├── tsconfig.json                            # TypeScript configuration
└── README.md                                # This file

---

## 🗄️ Database Schema

The application uses a relational schema with the following core tables:

### Core Tables

#### 1. **Profiles Table**
Stores user profile information and authentication state.

```sql
create table public.profiles (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid unique not null,
  email             text unique not null,
  full_name         text,
  bio               text,
  avatar_url        text,
  skills            text[] default '{}',
  department        text,
  year              integer,
  github_url        text,
  portfolio_url     text,
  academic_focus    text,
  fingerprint       text,
  verified          boolean default false,
  profile_complete  boolean default false,
  is_admin          boolean default false,
  is_suspended      boolean default false,
  score             integer default 500,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
```

#### 2. **Projects Table**
Stores team project information with vacancy tracking.

```sql
create table public.projects (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references public.profiles(user_id) on delete cascade,
  title            text not null,
  description      text,
  required_skills  text[] default '{}',
  slots            integer not null,
  filled_slots     integer default 0,
  visibility       text default 'public' check (visibility in ('public', 'private')),
  status           text default 'open' check (status in ('open', 'in_progress', 'completed')),
  github_repo      text,
  vault_files      text[],
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
```

#### 3. **Applications Table**
Stores join requests and application status.

```sql
create table public.applications (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects(id) on delete cascade,
  applicant_id     uuid not null references public.profiles(user_id) on delete cascade,
  status           text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at       timestamptz default now(),
  updated_at       timestamptz default now(),
  unique(project_id, applicant_id)
);
```

#### 4. **Notifications Table**
Stores user notifications with rich metadata support.

```sql
create table public.notifications (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles(user_id) on delete cascade,
  type      text not null,
  message   text not null,
  link      text,
  metadata  jsonb default '{}'::jsonb,
  read      boolean default false,
  created_at timestamptz default now()
);

create index notifications_user_id_created_at_idx 
  on public.notifications (user_id, created_at desc);

create index notifications_user_id_read_idx 
  on public.notifications (user_id, read, created_at desc);
```

#### 5. **OTP Codes Table**
Stores one-time passwords for verification and password resets.

```sql
create table public.otp_codes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid unique not null references public.profiles(user_id) on delete cascade,
  code       text not null,
  expires_at timestamptz not null,
  used       boolean default false,
  created_at timestamptz default now()
);
```

### Row Level Security Policies

```sql
-- Profiles: Public read, users update their own
alter table public.profiles enable row level security;

create policy "Users can view profiles" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = user_id);

-- Applications: Users view their own, admins view all
alter table public.applications enable row level security;

create policy "Users can view own applications" on public.applications
  for select using (auth.uid() = applicant_id);

-- Notifications: Users view only their own
alter table public.notifications enable row level security;

create policy "Users can view own notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update own notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- Projects: Public read, owners manage their own
alter table public.projects enable row level security;

create policy "Anyone can view projects" on public.projects
  for select using (true);

create policy "Project owners can manage own projects" on public.projects
  for update using (auth.uid() = owner_id);

create policy "Users can insert projects" on public.projects
  for insert with check (auth.uid() = owner_id);

create policy "Project owners can delete own projects" on public.projects
  for delete using (auth.uid() = owner_id);
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

### Phase 3 — Project Feed & Applications
- ✅ Public landing feed (title + vacancy count only)
- ✅ Private dashboard feed (full details after login)
- ✅ Create/edit project pages
- ✅ Project deletion with name confirmation
- ✅ Application & join request workflows
- ✅ Profile page with contact links (email, GitHub, LinkedIn, portfolio)
- ⏳ Vault logic (GitHub + files revealed only after Accept)

### Phase 4 — Notifications & Team Management ✅ COMPLETED
- ✅ Notifications table with join request tracking
- ✅ Unread badge counter (navbar & sidebar) with real-time updates
- ✅ View Profile button for applicants
- ✅ Notification management (mark read, dismiss, actions)
- ✅ Hard delete with cascading cleanup (deletes applications & notifications)
- ✅ Email/GitHub/LinkedIn/Portfolio links on profile pages
- ⏳ Real-time notification WebSocket updates

### Phase 5 — AI Matching Engine
- OpenAI/Cohere embeddings stored in pgvector
- Cosine similarity search with skill weighting
- Natural language search bar on dashboard

### Phase 6 — Advanced Features
- Supabase Realtime chat per project thread
- Accountability score system with PostgreSQL triggers
- Project vault logic (GitHub + files revealed only after Accept)
- Team analytics and collaboration insights

---

## 🔌 API Endpoints

### Authentication Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/[...nextauth]` | NextAuth OAuth/credential handler |
| GET | `/api/auth/check-username` | Check username availability |
| POST | `/api/auth/forgot-password` | Send password reset OTP |
| POST | `/api/auth/reset-password` | Update password with OTP |
| POST | `/api/auth/verify-reset-otp` | Validate OTP for password reset |
| POST | `/api/send-otp` | Send verification OTP |
| POST | `/api/verify-otp` | Validate verification OTP |

### Project Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/projects` | Fetch all public projects |
| GET | `/api/projects/[id]` | Get single project details |
| POST | `/api/projects` | Create new project |
| PUT | `/api/projects/[id]` | Update project details |
| DELETE | `/api/projects/[id]` | Delete project with cascading cleanup |

**Delete Request Body:**
```json
{
  "confirmProjectName": "Exact Project Title"
}
```

### Applications Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/applications` | Fetch user applications |
| POST | `/api/applications` | Apply/join a project |
| PUT | `/api/applications/[id]` | Update application status |

### Notifications Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/notifications` | Fetch user notifications |
| GET | `/api/notifications/unread-count` | Get unread notification count |
| PUT | `/api/notifications/[id]` | Mark notification read |
| DELETE | `/api/notifications/[id]` | Dismiss notification |

**Unread Count Response:**
```json
{
  "unreadCount": 5
}
```

### User Profile Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/user/profile` | Get current user profile |
| POST | `/api/user/profile` | Update user profile |
| GET | `/api/user/export` | Export user data (GDPR) |

### Admin Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/admin/export` | Admin data export |
| POST | `/api/admin/score` | Update user score |

---

## 🎯 Feature Highlights

### 📬 Notifications System
The app tracks join requests, acceptances, and project updates through a rich notification metadata system:

**Notification Types:**
- `join_request` — Someone applied to your project
- `application_accepted` — Your application was accepted
- `application_rejected` — Your application was rejected
- `project_updated` — A project you're on was updated

**Key Features:**
- Unread badge counter in navbar and sidebar
- Metadata includes `applicant_id` and `project_id` for easy navigation
- View Profile link for applicants (direct access to their portfolio)
- Mark as read / dismiss actions
- Cascading deletion ensures no orphaned records

### 🗑️ Safe Project Deletion
Projects can be deleted by owners with name confirmation:

**Deletion Flow:**
1. Owner navigates to project page and clicks delete
2. Confirmation modal requires typing the exact project name
3. On confirmation, triggers cascading delete:
   - All applications referencing the project
   - All notifications containing the project_id
   - The project row itself
4. User is redirected to dashboard with success message

### 👤 Enhanced Profile Pages
User profiles now display comprehensive contact information:

**Profile Features:**
- Email (with `mailto:` link)
- GitHub URL (with link and "GitHub" label)
- LinkedIn URL (detected by domain, labeled as "LinkedIn")
- Portfolio/website link (generic label for other domains)
- All links properly validate URLs with https:// scheme

### 🎓 Project Management
- Create public/private projects with description and skill requirements
- Track vacancy slots (e.g., "3 spots left")
- Accept/reject team join requests
- View applicant profiles before accepting
- Delete projects with data integrity guarantees

---

## � Key Components (Phase 4)

### Notification Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `NotifBell` | `components/Notifications/NotifBell.tsx` | Bell icon with unread badge |
| `NotifItem` | `components/Notifications/NotifItem.tsx` | Individual notification card |
| `NotifActions` | `app/notifications/NotifActions.tsx` | Accept/reject + View Profile buttons |

### Project Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `ApplyButton` | `components/project/ApplyButton.tsx` | Apply to project button |
| `ApplyModal` | `components/project/ApplyModal.tsx` | Application confirmation modal |
| `DeleteProjectControl` | `app/projects/[id]/DeleteProjectControl.tsx` | Delete with name confirmation |
| `ProjectCard` | `components/project/ProjectCard.tsx` | Reusable project display card |
| `ApplySection` | `app/projects/[id]/ApplySection.tsx` | Owner/applicant view toggle |

### Navigation Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `DashboardNavbar` | `components/DashboardNavbar.tsx` | Top nav with unread badge |
| `DashboardSidebar` | `components/DashboardSidebar.tsx` | Left sidebar with unread count |

### Profile Components
| Component | Location | Purpose |
|-----------|----------|---------|
| `ProfileCard` | `components/profile/ProfileCard.tsx` | User profile display card |
| `ScoreHistory` | `components/profile/ScoreHistory.tsx` | Score tracking chart |

---

## �🤝 Contributing

This is a university project. For contributions or issues, open a pull request or raise an issue on GitHub.

---

## 📄 License

MIT License — feel free to use and modify.