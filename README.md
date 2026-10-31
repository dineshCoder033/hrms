# TaskOrbit HRMS & Helix Enterprise Workforce CRM

A modern, full-stack Human Resource Management System (HRMS) built with **React 18, Vite, Tailwind CSS, GSAP Animations, Node.js, Express, and MongoDB**.

Designed pixel-for-pixel according to the **TaskOrbit / Helix CRM** aesthetic with production-grade backend architecture, JWT authentication, shift & attendance auto-classification, leave balance management, LOP payroll calculation, talent pipeline, OKR tracking, and CSV exports.

---

## 🎨 Design & Aesthetic Highlights

- **Obsidian Dark & Electric Lime Palette**: High-contrast, sleek modern styling (`#111317`, `#C7F436`, `#FCFDFE`).
- **Top Schedule Bar**: Pill timeline showing live time markers, meeting slots, team avatars, notifications, and user session menu.
- **Floating Dock Navigation**: Smooth client-side navigation with route indicators.
- **Dynamic Micro-Interactions**: GSAP staggered entrance animations, live punch ticker, and optimistic UI updates.
- **Full Page Vertical Scroll**: Smooth page scrolling with responsive layouts across mobile, tablet, and widescreen.

---

## 🚀 Key Modules & Architecture

### 1. Authentication & Role-Based Access Control (RBAC)
- **Roles**: `Admin`, `HR_Manager`, `Employee`.
- **JWT Architecture**: Access tokens with payload serialization (`id`, `email`, `role`, `name`) and refresh tokens.
- **Frontend Auth**: Persistent `AuthContext`, Axios interceptors with automatic bearer token attachment, protected routes, and instant demo quick-login buttons.

### 2. Time & Attendance Engine
- **Punch In/Out**: Biometric punch simulation calculating real worked hours using server time.
- **Auto Classification**:
  - Automatically marks **Late** if clock-in is past 09:30 AM.
  - Automatically flags **Half-Day** if shift duration is under 4 hours.
- **Monthly Heatmap & Aggregations**: `/api/attendance/monthly-report` and 1-click CSV export (`/api/export/attendance`).

### 3. Leave Management & Balance Engine
- **Calendar Logic**: Accurately computes working days by excluding Saturdays, Sundays, and public holidays.
- **Conflict Prevention**: 400 Bad Request error if dates overlap with existing approved/pending leaves.
- **Balance Tracking**: Deducts quota only on approval across Annual, Casual, Sick, and Unpaid leave categories.

### 4. Payroll & Compensation Engine
- **CTC Breakdown**: Formulaic split into Basic Pay (50%), HRA (30%), Special Allowance (20%), PF Deduction (12% of basic), and Tax withholding.
- **Loss of Pay (LOP)**: Auto-calculates unpaid leave days and deducts pro-rata daily salary.
- **Batch Processing & Lock**: `/api/payroll/generate` runs monthly batch, `/api/payroll/pay-all` marks payouts and locks records.
- **Itemized Payslip**: Detailed payslip view via `/api/payroll/:id/payslip`.

### 5. Recruitment & Talent CRM
- **Job Requisitions**: Post and manage open positions across Engineering, HR, Design, and Product.
- **Candidate Pipeline**: Multi-stage evaluation (`Screening` ➔ `Interview` ➔ `Offer` ➔ `Hired` / `Rejected`).

### 6. Goals & Performance (OKRs)
- **Objectives & Key Results**: Company and individual targets with interactive progress sliders.

### 7. HR Analytics & Data Export
- Comprehensive workforce analytics at `/api/analytics`.
- Instant CSV streaming for employee records (`/api/export/employees`) and attendance logs (`/api/export/attendance`).

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router 7, Tailwind CSS, GSAP, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, Zod (Validation), Helmet, Express Rate Limit, JWT, Bcrypt |
| **Database** | MongoDB (Mongoose) with seamless in-memory fallback for instant zero-config dev |

---

## ⚡ Quick Start Guide

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```
*Server starts on `http://localhost:5000` (API root: `http://localhost:5000/api`)*

Optional: Seed sample MongoDB data:
```bash
npm run seed
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*Frontend starts on `http://localhost:5173`*

### 3. Production Build
```bash
cd client
npm run build
```

---

## 🔐 Demo Credentials

When opening the app at `http://localhost:5173/login`, use the **Quick Demo Login** buttons or enter:
- **Admin**: `admin@taskorbit.com` / `admin123`
- **HR Manager**: `hr@taskorbit.com` / `admin123`
- **Employee**: `employee@taskorbit.com` / `admin123`
