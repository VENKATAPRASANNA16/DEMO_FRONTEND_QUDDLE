const express = require('express');
const router = express.Router();
const UserAction = require('../models/UserAction');

router.post('/', async (req, res) => {
  try {
    const action = new UserAction(req.body);
    await action.save();
    res.json({ success: true, action });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;