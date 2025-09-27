const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/quddle', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('MongoDB error:', err));

// In-memory OTP store (could use Redis in production)
let otpStore = {};

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Quddle Backend is Running!' });
});

// Send OTP
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { phone, email } = req.body;
    if (!phone && !email) return res.status(400).json({ error: 'Phone or email required' });

    const otp = '123456'; // demo only
    const key = phone || email;
    otpStore[key] = otp;

    console.log(`OTP for ${key}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      otp // For demo only — remove in production
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, email, otp, interests } = req.body;
    const key = phone || email;

    if (!otp || otp !== otpStore[key]) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Find existing user or create a new one
    let user = await User.findOne({ $or: [{ phone }, { email }] });

    if (!user) {
      user = new User({
        phone,
        email,
        name: `User ${Date.now()}`,
        interests: interests || [],
        verified: true
      });
    } else {
      user.verified = true;
      if (interests) user.interests = interests;
    }

    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        interests: user.interests
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Quddle Backend running at http://localhost:${PORT}`);
});
