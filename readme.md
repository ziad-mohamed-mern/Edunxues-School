<div align="center">
  <h1>🎓 Edunexus</h1>
  <p>A comprehensive and modern Education Management System (EMS) designed for schools, academies, and educational institutions.</p>
</div>

<br />

## 🌟 Overview

**Edunexus** is a full-stack web application tailored to streamline institutional workflows, manage academic progress, and enhance communication between administrators, teachers, students, and parents. With a premium, modern dashboard aesthetic and powerful automated backend features, Edunexus acts as the central hub for any modern educational institution.

---

## 🚀 Key Features

*   **👥 User Management:** Comprehensive directory for Students, Teachers, Parents, and Administrators. Role-based access control out of the box.
*   **🏫 Academic Organization:** Manage Academic Years, Classes, and Subjects with ease.
*   **📅 Automated Timetables:** Automatically generate class timetables and schedules using background tasks powered by Inngest.
*   **📚 Learning Management System (LMS):**
    *   Distribute Study Materials.
    *   Create and manage Assignments and Submissions.
    *   Automated Exam and Quiz generation.
*   **💰 Finance Dashboard:** Track Fee collections, monitor institutional Expenses, and manage staff Payroll/Salary in dedicated premium dashboards.
*   **⚙️ Advanced Settings:** Configure School Profiles, Localization (language & timezone), Notifications, and control Maintenance Modes.
*   **📈 Activities Log:** Real-time logging of system administration actions.

---

## 💻 Tech Stack

### Frontend
*   **Framework:** React 18 with Vite
*   **Routing:** React Router v6
*   **Styling:** Tailwind CSS + Shadcn UI (for premium, accessible, and customizable components).
*   **Icons:** Lucide React

### Backend
*   **Runtime:** Node.js with Express.js
*   **Database:** MongoDB (via Mongoose)
*   **Background Jobs:** Inngest (Handles heavy lifting for Exam and Timetable generation asynchronously)
*   **Security:** Helmet, CORS, Cookie Parser

---

## 🏗️ Project Structure

This project is a monorepo consisting of two main directories:

```text
edunexus/
├── backend/          # Express API server, Mongoose models, Inngest jobs
│   ├── src/
│   │   ├── config/      # DB Connection
│   │   ├── controllers/ # API Logic
│   │   ├── inngest/     # Background functions (e.g. generateTimeTable)
│   │   ├── middleware/  # Auth & Error handling
│   │   ├── models/      # Mongoose Schemas (User, Class, Exam, etc.)
│   │   ├── routes/      # Express API definitions
│   │   └── server.ts    # Application entry point
│   └── ...
└── frontend/         # Vite React application
    ├── src/
    │   ├── components/  # Reusable UI components (Shadcn + Custom)
    │   ├── hooks/       # Custom React Hooks (e.g., AuthProvider)
    │   ├── lib/         # API clients and utilities
    │   ├── pages/       # Application route views (Dashboard, Settings, Finance, etc.)
    │   ├── types.ts     # Global TypeScript definitions
    │   └── main.tsx     # App entry point
    └── ...
```

---

## 🏃‍♂️ Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local instance or Atlas URI)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file in the `/backend` folder with at least the following:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   CLIENT_URL=http://localhost:5173
   STAGE=development
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file in the `/frontend` folder:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development environment:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! If you're contributing, please ensure you test your changes thoroughly against both the frontend and backend architectures.

---

## 📝 License

This project is proprietary and built for demonstration/educational purposes.
