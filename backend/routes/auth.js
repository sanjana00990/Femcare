const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Try to use Mongoose User model; fall back to in-memory store if DB is not connected
let User;
try { User = require('../models/User'); } catch (e) { User = null; }

// ── In-memory fallback store ──────────────────────────────────────────────────
const memUsers = []; // { _id, name, email, passwordHash, condition, age }
let memIdCounter = 1;

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });

function isDbConnected() {
  try {
    const mongoose = require('mongoose');
    return mongoose.connection.readyState === 1;
  } catch { return false; }
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, condition, age } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please provide name, email and password' });

    if (isDbConnected()) {
      // ── Real DB path ──
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'User already exists with this email' });
      const user = await User.create({ name, email, password, condition: condition || 'general', age });
      return res.status(201).json({
        _id: user._id, name: user.name, email: user.email,
        condition: user.condition, token: generateToken(user._id)
      });
    } else {
      // ── In-memory fallback path ──
      const exists = memUsers.find(u => u.email === email.toLowerCase());
      if (exists) return res.status(400).json({ message: 'User already exists with this email' });
      const passwordHash = await bcrypt.hash(password, 12);
      const user = {
        _id: `mem_${memIdCounter++}`,
        name, email: email.toLowerCase(),
        passwordHash,
        condition: condition || 'general',
        age
      };
      memUsers.push(user);
      console.log('ℹ️  [In-Memory] Registered user:', email);
      return res.status(201).json({
        _id: user._id, name: user.name, email: user.email,
        condition: user.condition, token: generateToken(user._id)
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' });

    if (isDbConnected()) {
      // ── Real DB path ──
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password)))
        return res.status(401).json({ message: 'Invalid email or password' });
      return res.json({
        _id: user._id, name: user.name, email: user.email,
        condition: user.condition, age: user.age, token: generateToken(user._id)
      });
    } else {
      // ── In-memory fallback path ──
      const user = memUsers.find(u => u.email === email.toLowerCase());
      if (!user) return res.status(401).json({ message: 'Invalid email or password' });
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(401).json({ message: 'Invalid email or password' });
      console.log('ℹ️  [In-Memory] Logged in user:', email);
      return res.json({
        _id: user._id, name: user.name, email: user.email,
        condition: user.condition, age: user.age, token: generateToken(user._id)
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
});

module.exports = router;
