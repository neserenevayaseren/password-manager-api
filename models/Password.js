const mongoose = require('mongoose');

const passwordSchema = new mongoose.Schema({
  title: { type: String, required: true },
  login: { type: String, required: true },
  password: { type: String, required: true },
  history: [{ 
    action: String, 
    date: { type: Date, default: Date.now } 
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Password', passwordSchema);