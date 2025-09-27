const mongoose = require('mongoose');

const userActionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  action: { type: String, required: true },
  data: { type: Object },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserAction', userActionSchema);