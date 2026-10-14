# StayHub — Pro Room Rentals & Property Management Platform

StayHub is a modern, full-featured web platform connecting property owners with guests seeking premium room rentals. It includes real-time booking flows, interactive interactive map-based discovery, comprehensive property management, automated tenant analytics, messaging, and Google Gemini AI-powered features.

---

## 🌟 Key Features

### 👤 Guest Experience
- **Interactive Room Discovery**: Search, filter by budget, location, amenities, and room type with real-time Leaflet map integration.
- **Detailed Room Profiles**: High-resolution image galleries, 360/video tour modals, pricing breakdowns, rules, and host information.
- **Streamlined Booking & Requests**: Instant booking or request-to-book workflow with real-time status updates (Pending, Accepted, Active, Completed).
- **Guest Dashboard**: Centralized dashboard to track past, active, and upcoming bookings, review accepted stays, and manage reservations.
- **In-App Messaging**: Chat directly with room owners for inquiries, tour requests, and check-in logistics.

### 🏢 Host & Owner Experience
- **Owner Command Center**: Analytics dashboard featuring dynamic Recharts for revenue tracking, occupancy rates, and inquiry trends.
- **Listing Management**: Add, edit, or toggle availability of properties, set pricing, security deposits, house rules, and amenities.
- **Booking Request Approvals**: Review guest requests with accept/decline actions that automatically sync room status.
- **Tenant & Booking Tracking**: View active tenants, lease schedules, and download reports (CSV/data export via PapaParse).

### 🤖 Smart & AI Integration
- **AI-Powered Recommendations & Descriptions**: Integrated with `@google/genai` to assist hosts in crafting descriptions and answering guest inquiries.
- **Authentication & Security**: Secure authentication powered by Firebase Auth.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 6
- **Routing**: React Router v7
- **Styling**: Tailwind CSS + Custom Design System
- **Icons**: Lucide React
- **Maps**: Leaflet & React Leaflet
- **Charts & Data Viz**: Recharts & React CountUp
- **Toasts & Feedback**: React Hot Toast
- **Data Export**: PapaParse & FileSaver

### Backend
- **Framework**: Django & Django REST Framework (Python)
- **Database**: SQLite (Development) / PostgreSQL compatible
- **Features**: RESTful APIs for Properties, Bookings, Messaging, and Dashboard Analytics

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Python 3.10+](https://www.python.org/) (for the backend service)
- Git

---

### 1. Frontend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/galcharjaswant01-code/Room.git
   cd Room
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` or update existing environment variables with your keys:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 2. Backend Setup (Optional / Full-Stack)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Set up a virtual environment**:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Run database migrations**:
   ```bash
   python manage.py migrate
   ```

4. **Seed mock data (optional)**:
   ```bash
   python seed_db.py
   ```

5. **Start the Django server**:
   ```bash
   python manage.py runserver 8000
   ```
   The backend API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

## 📦 Build for Production

To create an optimized production build of the frontend:
```bash
npm run build
```
The output will be generated in the `dist` folder, ready for deployment on platforms like Vercel, Netlify, or Firebase Hosting.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
