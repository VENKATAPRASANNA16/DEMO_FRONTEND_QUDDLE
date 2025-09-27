const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/login', async (req, res) => {
  try {
    const { email, password, action } = req.body;
    
    let user;
    if (action === 'register') {
      user = new User({ email, name: email.split('@')[0] });
      await user.save();
    } else {
      user = await User.findOne({ email }) || await User.create({ email, name: email.split('@')[0] });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;