// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');

// const authRoutes = require('./routes/auth');
// const cycleRoutes = require('./routes/cycle');
// const symptomRoutes = require('./routes/symptoms');
// const insightRoutes = require('./routes/insights');
// const dietRoutes = require('./routes/diet');
// const exerciseRoutes = require('./routes/exercise');
// const reportRoutes = require('./routes/report');
// const doctorRoutes = require('./routes/doctors');

// const app = express();

// // Middleware
// app.use(cors({
//   origin: function(origin, callback) {
//     if (!origin || origin.endsWith('.vercel.app') || origin === 'http://localhost:5173') {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));
// app.use(express.json());

// // Connect to DB before handling any route
// let isConnected = false;
// async function connectDB() {
//   if (isConnected) return;
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     isConnected = true;
//     console.log('✅ MongoDB connected successfully');
//   } catch (err) {
//     console.error('❌ MongoDB connection failed:', err.message);
//   }
// }

// app.use(async (req, res, next) => {
//   await connectDB();
//   next();
// });

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/cycle', cycleRoutes);
// app.use('/api/symptoms', symptomRoutes);
// app.use('/api/insights', insightRoutes);
// app.use('/api/diet', dietRoutes);
// app.use('/api/exercise', exerciseRoutes);
// app.use('/api/report', reportRoutes);
// app.use('/api/doctors', doctorRoutes);

// // Health check
// app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'FemCare AI API is running' }));

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Internal server error', error: err.message });
// });

// if (process.env.NODE_ENV !== 'production') {
//   const PORT = 5001;
//   app.listen(PORT, async () => {
//     await connectDB();
//     console.log(`🚀 Server running on http://localhost:${PORT}`);
//   });
// }

// // Export the Express API for Vercel
// module.exports = app;
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const cycleRoutes = require('./routes/cycle');
const symptomRoutes = require('./routes/symptoms');
const insightRoutes = require('./routes/insights');
const dietRoutes = require('./routes/diet');
const exerciseRoutes = require('./routes/exercise');
const reportRoutes = require('./routes/report');
const doctorRoutes = require('./routes/doctors');

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.endsWith('.vercel.app') || origin === 'http://localhost:5173') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    isConnected = false;
    console.error('❌ MongoDB connection failed:', err.message);
    throw err;
  }
}

// Try connecting to DB in background — routes handle the fallback themselves
connectDB().catch(() => {
  console.log('ℹ️  Running in in-memory mode. Register/login still work for this session.');
});

app.use('/api/auth', authRoutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/exercise', exerciseRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/doctors', doctorRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'FemCare AI API is running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

if (require.main === module || (process.env.NODE_ENV !== 'production' && !process.env.VERCEL)) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    try {
      await connectDB();
    } catch (err) {
      console.error('⚠️ Server started but DB connection failed:', err.message);
    }
  });
}

module.exports = app;