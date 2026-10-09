# FemCare AI

FemCare AI is a full-stack women’s wellness and health tracking platform designed to help users manage menstrual health, track hormonal symptoms, receive personalized health insights, and discover nearby medical support. The platform combines clinical symptom analysis, cycle forecasting, lifestyle recommendations, and location-aware care discovery into a single user-friendly experience.

This project was developed as a modern health-tech application using a React frontend, Node.js/Express backend, and MongoDB database, with a strong emphasis on usability, privacy, and responsive design. It is built to demonstrate practical implementation of healthcare-focused product features in a production-ready web app architecture.

---

## Project Overview

FemCare AI serves as a digital wellness assistant for women by offering:

- Menstrual cycle tracking and prediction
- Symptom logging and clinical risk assessment
- Personalized recommendations for nutrition and exercise
- AI-inspired health insights based on cycle behavior and symptom patterns
- Educational content on common women’s health conditions
- Local healthcare provider discovery using browser geolocation and real-time map data

The product is designed for both daily health management and decision support, making it relevant for personal wellness tracking and early awareness of recurring symptoms.

---

## Core Features Implemented

### 1. Secure Authentication and User Management
- User registration and login with email + password
- JWT-based session handling
- Protected routes to restrict access to personalized health data
- User profile context maintained in frontend state
- Fallback in-memory authentication flow for local/demo environments

Technologies used:
- React + Context API
- Express.js
- JWT
- bcryptjs
- MongoDB with Mongoose

### 2. Period and Cycle Tracking
- Log menstrual cycle start date and end date
- Track flow intensity and notes
- Calculate cycle length when enough data is available
- Determine current cycle day and reproductive phase
- Predict next period date based on historical averages
- Display cycle history with automated summaries

Technologies used:
- React frontend state management
- Express REST APIs
- MongoDB schemas for cycle tracking
- JavaScript date logic and data calculations

### 3. Personal Dashboard
- Custom wellness dashboard with cycle status and health summary
- Displays current cycle day, phase, next period prediction, and average cycle length
- Surfaces quick access actions for core features
- Combines local and backend data for a streamlined user experience
- Uses dynamic cards and insight sections for a polished dashboard UX

Technologies used:
- React
- Vite
- Tailwind CSS
- Custom component architecture
- Axios API integration

### 4. Clinical Symptom Checker and Health Assessment
- Multi-step symptom questionnaire covering basic health, menstrual health, physical symptoms, and mood-related concerns
- Rule-based clinical scoring engine for conditions such as:
  - PCOS / PCOD
  - Menopause / perimenopause
  - General wellness profile
- Generates structured health reports with:
  - Primary condition assessment
  - Confidence score
  - Narrative explanation
  - Recommended lab tests
  - Lifestyle suggestions
  - Treatment guidance
- Provides print-ready professional report output

Technologies used:
- React form-driven interface
- JavaScript scoring logic
- Tailwind styling
- LocalStorage persistence for report history

### 5. AI-Inspired Health Insights Engine
- Analyzes logged cycles and symptoms to generate personalized health insights
- Detects patterns such as:
  - Irregular cycles
  - Possible hormonal imbalance indicators
  - Frequent fatigue patterns
  - Symptom clusters related to PCOS or menopause
- Generates insight cards with age-appropriate health guidance

Technologies used:
- Express.js route logic
- MongoDB data aggregation from cycle and symptom records
- Rule-based recommendation engine
- React dashboard rendering

### 6. Symptom Journal and Health Logging
- Log daily symptoms with severity tracking
- Maintain a visible history of symptom data
- Supports journaling for mood, physical health, and general well-being
- Stores entries for trend analysis and dashboard summaries

Technologies used:
- React state and form handling
- Express backend endpoints
- MongoDB symptom schema
- LocalStorage fallback for demo continuity

### 7. Nutrition and Diet Recommendations
- Condition-specific diet guidance for common wellness states
- Personalized food recommendations by user condition and health profile
- Suggested dietary improvements based on current health needs

Technologies used:
- Express API route for diet data
- JavaScript recommendation logic
- React UI cards for nutritional suggestions

### 8. Exercise and Wellness Guidance
- Condition-aware exercise plans and movement suggestions
- Phase-based recommendations aligned with menstrual cycle stages
- Simple and practical wellness guidance to support daily health routines

Technologies used:
- Express route-based logic
- React-based wellness cards
- Condition and phase filtering

### 9. Educational Health Learning Hub
- Informational modules covering key women’s health topics
- Includes sectioned breakdowns for:
  - PCOS
  - PCOD
  - Menopause
- Each module includes causes, symptoms, diagnostics, complications, and treatment options
- Links to official health resources for credibility

Technologies used:
- React accordion components
- Tailwind styling
- Structured content model in frontend

### 10. Nearby Healthcare Provider Discovery
- Detects user location using browser geolocation
- Lets users search by city or area when needed
- Uses OpenStreetMap and Overpass APIs to fetch nearby providers
- Displays healthcare facilities such as gynecologists, maternity centers, fertility clinics, and multispeciality hospitals
- Shows map markers with provider information and distance
- Filters by rating, open/closed status, and multispeciality availability
- Includes sort options by distance, reviews, and rating
- Offers directions via Google Maps

Technologies used:
- React + Leaflet
- react-leaflet
- OpenStreetMap tiles
- Nominatim reverse geocoding
- Overpass API data retrieval
- JavaScript filtering and sorting logic
- Express backend integration

### 11. Theme Support and Responsive UI
- Dark and light mode toggle
- Glassmorphism-inspired visual design with modern color palette
- Responsive layouts across desktop and mobile screens
- Consistent component patterns across all major views

Technologies used:
- React Context for theme management
- Tailwind CSS
- Custom CSS variables and design tokens

### 12. Offline-Friendly Data Handling
- LocalStorage-based fallback for cycle tracking, reports, and journal entry experience
- Maintains app continuity in environments where backend connectivity is limited
- Improves demo readiness and resilience

Technologies used:
- Browser localStorage API
- Frontend fallback logic

---

## Feature-to-Technology Matrix

| Feature | Description | Primary Technologies |
| --- | --- | --- |
| Authentication | Secure login and protected access | React, Express, JWT, bcryptjs |
| Cycle Tracking | Log periods, predict cycle length, phase tracking | React, Node.js, MongoDB |
| Dashboard | Health summary and personalized insights | React, Tailwind CSS |
| Symptom Checker | Questionnaire-based assessment | React, JavaScript scoring engine |
| Insights Engine | Personalized trend-based recommendations | Node.js, MongoDB, React |
| Journal | Daily symptom logging | React, Express, MongoDB |
| Nutrition | Diet and wellness guidance | Express, React |
| Exercise | Personalized wellness plans | Express, React |
| Learn Module | Educational content | React, Tailwind CSS |
| Doctors / Clinics | Nearby medical provider discovery | React, Leaflet, OpenStreetMap APIs |
| Reporting | Professional printable summary report | React, DOM printing, local storage |
| Theme UI | Responsive design and dark mode | Tailwind CSS, React Context |

---

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- React-Leaflet
- Chart.js + react-chartjs-2
- Lucide React icons
- Axios for API communication

### Backend
- Node.js
- Express.js
- JWT authentication
- bcryptjs for password hashing
- Mongoose for MongoDB modeling

### Database
- MongoDB
- Mongoose ODM

### APIs and Integrations
- OpenStreetMap Overpass API for healthcare provider search
- Nominatim reverse geocoding
- Google Maps directions links

### Deployment and DevOps
- Vercel deployment configuration
- npm-based package management
- Environment configuration using .env files

---

## Architecture Overview

The application follows a modern three-layer architecture:

- Frontend: Single-page React application for user interaction and presentation
- Backend: REST API built with Express to manage auth, health data, recommendations, and provider lookup
- Database: MongoDB for structured persistence of users, cycles, symptoms, and cached provider results

This architecture keeps the application modular, scalable, and easy to extend with new health features, AI models, or integrations.

---

## Project Structure

```bash
femcare/
├── api/
│   └── index.js
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Cycle.js
│   │   ├── DoctorsCache.js
│   │   ├── Symptom.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── cycle.js
│   │   ├── diet.js
│   │   ├── doctors.js
│   │   ├── exercise.js
│   │   ├── insights.js
│   │   ├── report.js
│   │   └── symptoms.js
│   ├── package.json
│   ├── server.js
│   └── test.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── ...
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── index.html
├── package.json
├── README.md
├── vercel.json
└── ...
```

---

## Setup and Run Instructions

### Prerequisites
- Node.js 18+
- npm
- MongoDB instance or MongoDB Atlas connection string

### Install Dependencies

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### Environment Variables

Create a `.env` file inside the `backend` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5001
```

### Run the Application

```bash
# Start backend
cd backend
npm run dev

# Start frontend in a second terminal
cd frontend
npm run dev
```

The frontend is typically available at:
- http://localhost:5173

The backend API runs on:
- http://localhost:5001

---

## Deployment

The project is configured for deployment on Vercel with:
- Vite frontend build
- Express backend support via serverless API route
- MongoDB Atlas for cloud data persistence

The deployment setup is defined in `vercel.json` and supports both frontend delivery and API routing.

---

## Resume-Friendly Summary

FemCare AI is a full-stack women’s health and wellness platform that combines menstrual cycle tracking, clinical symptom assessment, personalized insights, nutrition and exercise guidance, educational content, and nearby healthcare discovery into one modern digital experience. Built using React, Node.js, Express, MongoDB, Tailwind CSS, and third-party health and mapping APIs, the project demonstrates end-to-end product development in healthcare technology, user experience design, API integration, and responsive web application architecture.

---

## License

This project is intended for educational and portfolio purposes.
