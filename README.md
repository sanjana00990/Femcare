# FemCare AI — Women's Wellness Platform

A comprehensive women's health and wellness platform powered by AI, built with **React**, **Node.js/Express**, and **MongoDB**. FemCare AI provides intelligent cycle tracking, symptom analysis, personalised health insights, and nearby healthcare provider discovery.

---

## ✨ Features

### 🩺 Clinical Symptom Checker
- AI-powered multi-step symptom assessment
- Condition detection for PCOS, PCOD, Menopause, and general wellness
- Detailed clinical reports with lab test suggestions and lifestyle modifications

### 📅 Period Tracker
- Log menstrual cycle data with start/end dates
- Automatic cycle phase detection (Menstrual, Follicular, Ovulation, Luteal)
- Next period prediction based on historical averages

### 📊 Dashboard
- Real-time cycle day, phase, and next period display
- AI health insights personalised to your condition
- Recent symptom severity tracking
- Quick action cards for fast navigation

### 📓 Symptom Journal
- Daily symptom logging with severity levels
- Historical symptom review

### 📈 Cycle Insights
- Trend analysis across cycles
- Pattern recognition for symptoms

### 🥗 Diet & Nutrition
- Condition-specific dietary recommendations
- Phase-aware nutrition guidance

### 🏋️ Exercise
- Personalised workout suggestions
- Phase-appropriate exercise intensity

### 📚 Learn
- Educational health content library
- Women's health articles and resources

### 📄 Reports
- Printable clinical assessment reports
- Comprehensive health summaries

### 🏥 Nearby Healthcare Providers
- **Auto-detect user location** via browser geolocation
- **Manual search** by city, area, or pincode
- Fetches **real nearby hospitals** from OpenStreetMap (Overpass API)
- Shows **top 5 nearest** gynaecologists, multispeciality hospitals, maternity hospitals, fertility centers, and women's health clinics
- **Auto-expands search radius** (5km → 10km → 15km → 25km) to guarantee minimum 3 results
- Interactive **Leaflet map** with color-coded markers by specialty
- **Filter chips**: Top Rated, Open Now, Multispeciality
- **Sort by**: Distance, Rating, Reviews
- Each result card shows: name, specialty, rating, reviews, distance, address, phone, opening hours, open/closed status
- **Directions** (Google Maps) and **Book/Info** action buttons
- Fallback to well-known hospitals if API is unavailable
- Suggested nearby cities and online consultation options in empty states

---

## 🛠️ Tech Stack

| Layer      | Technology                                      |
|------------|--------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS                    |
| Backend    | Node.js, Express.js                              |
| Database   | MongoDB Atlas (Mongoose)                         |
| Maps       | Leaflet + React-Leaflet, OpenStreetMap           |
| Geocoding  | Nominatim (OpenStreetMap) + Overpass API         |
| Charts     | Chart.js + react-chartjs-2                       |
| Icons      | Lucide React                                     |
| Auth       | JWT (JSON Web Tokens)                            |
| Deployment | Vercel (frontend + serverless backend)           |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/IDT-project.git
cd IDT-project

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

Create a `.env` file in the `backend/` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Running Locally

```bash
# Terminal 1 — Start backend (port 5001)
cd backend
npm run dev

# Terminal 2 — Start frontend (port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Project Structure

```
IDT-project/
├── frontend/
│   └── src/
│       ├── api/
│       │   └── axios.js           # Axios instance with auth interceptor
│       ├── components/
│       │   └── Layout.jsx         # Sidebar + header layout shell
│       ├── context/
│       │   ├── AuthContext.jsx     # Authentication state
│       │   └── ThemeContext.jsx    # Dark/light mode toggle
│       ├── pages/
│       │   ├── Dashboard.jsx      # Main dashboard with KPIs
│       │   ├── Doctors.jsx        # Nearby healthcare providers
│       │   ├── doctorsHelpers.js  # Overpass API fetch + utilities
│       │   ├── Symptoms.jsx       # AI symptom checker
│       │   ├── Tracker.jsx        # Period tracker
│       │   ├── Journal.jsx        # Symptom journal
│       │   ├── Insights.jsx       # Cycle insights
│       │   ├── Diet.jsx           # Diet recommendations
│       │   ├── Exercise.jsx       # Exercise plans
│       │   ├── Report.jsx         # Clinical reports
│       │   ├── Learn.jsx          # Health education
│       │   ├── Login.jsx          # Auth — login
│       │   └── Register.jsx       # Auth — register
│       ├── App.jsx                # Router + protected routes
│       ├── main.jsx               # Entry point
│       └── index.css              # Design system (glassmorphic)
├── backend/
│   ├── routes/
│   │   ├── auth.js                # Register/login endpoints
│   │   ├── cycle.js               # Period cycle CRUD
│   │   ├── symptoms.js            # Symptom logging
│   │   ├── insights.js            # AI insights engine
│   │   ├── diet.js                # Diet recommendations
│   │   ├── exercise.js            # Exercise suggestions
│   │   ├── report.js              # Report generation
│   │   └── doctors.js             # Nearby doctors API
│   ├── middleware/
│   │   └── auth.js                # JWT auth middleware
│   ├── models/                    # Mongoose schemas
│   └── server.js                  # Express app setup
└── vercel.json                    # Vercel deployment config
```

---

## 🎨 Design System

FemCare AI uses a premium **glassmorphic design system** with:

- **Light mode**: Rose & mauve palette with glass blur panels
- **Dark mode**: Deep plum feminine aesthetic
- Custom CSS properties for seamless theme switching
- Smooth micro-animations and hover effects
- Premium typography (DM Sans + Poppins)
- Responsive sidebar navigation

---

## 🌐 Deployment

Deployed on **Vercel** with:
- Frontend: Static build via Vite
- Backend: Serverless functions via `api/` directory
- Database: MongoDB Atlas cloud

---

## 📝 License

This project is for educational purposes as part of the IDT course project.
