# EXAMHUB INDIA — Production Educational Platform

A complete, production-ready futuristic student examination and academic accreditation portal built with **React**, **Vite**, **Tailwind CSS**, and **Firebase** (Authentication, Firestore, Storage) with seamless localStore persistence fallback.

---

## Key Highlights

- **Design Aesthetic:** Cyberpunk midnight navy (`#050814`), electric blue, and neon cyan accents with glassmorphism cards, interactive spider web geometric particle engine, and floating 3D superhero student mascot.
- **Unified Authentication:** Real-time Firebase Authentication with dual support for Students and Super Administrators, featuring password strength analysis and password recovery simulation.
- **Examination Management:** Live catalogs with multi-category search (Medical, Engineering, Civil Services, Railways, Central Recruitment) and instant candidate registration.
- **Hall Ticket Issuance:** Official admit card generator with barcode, candidate photo, test centre allocation, reporting times, and native browser print integration.
- **Results & Merit Scorecards:** Computer-verified scorecards with subject-wise marks breakdown, percentage, grade, percentile, All India Rank, and verification hashes.
- **Protected Admin Console:** Strict role-based access control (RBAC) enabling administrators to add/edit/disable students, create and schedule exams, calculate marks and publish results, and broadcast gazette bulletins.
- **Firestore Security Rules:** Ready-to-deploy `firestore.rules` and `storage.rules` enforcing strict candidate ownership and admin-only write permissions.

---

## Project Structure

```
examhub-platform/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx                 # Responsive navigation with badge & mobile drawer
│   │   ├── Footer.jsx                 # Official national disclaimer & helplines
│   │   ├── SpiderMascot3D.jsx         # Interactive superhero student mascot
│   │   ├── ParticlesBackground.jsx    # Canvas geometric cyber web particle engine
│   │   ├── HallTicketModal.jsx        # Printable official admit card modal
│   │   ├── ResultScorecardModal.jsx   # Printable official result scorecard modal
│   │   └── NotificationDrawer.jsx     # Slide-over announcements drawer
│   ├── context/
│   │   ├── AuthContext.jsx            # Firebase Auth + persistent session provider
│   │   └── ExamContext.jsx            # Reactive CRUD for exams, hall tickets & results
│   ├── firebase/
│   │   └── config.js                  # Firebase initialization + localStore fallback
│   ├── pages/
│   │   ├── Home.jsx                   # Hero, stats, popular exams, benefits, FAQs
│   │   ├── Login.jsx                  # Student & Admin sign in with autofill demo pills
│   │   ├── Register.jsx               # 12-field student registration form
│   │   ├── StudentDashboard.jsx       # Personalized candidate command center
│   │   ├── StudentProfile.jsx         # View and edit student profile in Firestore
│   │   ├── Exams.jsx                  # Catalog, search, filters & instant registration
│   │   ├── HallTickets.jsx            # View, print and download admit cards
│   │   ├── Results.jsx                # Verified results portal with search
│   │   ├── Notifications.jsx          # Gazette announcements bulletin feed
│   │   ├── AdminDashboard.jsx         # Full administrative console with tabs
│   │   ├── About.jsx                  # Mission, national vision & accreditation
│   │   ├── Contact.jsx                # Help desk & grievance redressal mechanism
│   │   ├── Privacy.jsx                # Student data privacy policy (DPDPA)
│   │   └── Terms.jsx                  # Academic integrity & terms of service
│   ├── App.jsx                        # View routing & protected route guards
│   ├── main.jsx                       # Entry point mounting context providers
│   └── index.css                      # Tailwind directives & glassmorphism theme
├── firestore.rules                    # Production security rules
├── storage.rules                      # Production storage security rules
├── firebase.json                      # Hosting and Firestore deployment specs
├── vite.config.js                     # Vite build configuration
├── tailwind.config.js                 # Cyberpunk midnight theme tokens
└── package.json                       # Dependencies & scripts
```

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
Generates optimized static assets in `dist/`.

---

## Verified Demo Credentials

When running in Demo Mode (without live Firebase keys), you can log in with:

| Role | Email | Password |
|---|---|---|
| **Student / Super Admin** | No demo credentials are shipped. Configure Firebase Authentication and provision administrator roles securely. |

---

## Firebase Configuration

To connect a live Firebase project:
1. Create a project at [https://console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Email/Password** authentication in Firebase Authentication.
3. Enable **Cloud Firestore** and **Firebase Storage**.
4. Copy `.env.example` to `.env.local` and fill in your Firebase project configuration credentials.
5. Deploy rules using Firebase CLI:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```
