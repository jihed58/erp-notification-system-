const { getSystemDB } = require('../config/db');

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['erp_manager', 'admin', 'user'],
    default: 'user',
  },
  department: {
    type: String,
    enum: ['Ressources Humaines', 'Logistique & Stock', 'Commercial & Ventes', 'Finance & Comptabilité', 'Maintenance', 'Achats & Approvisionnement', null],
    default: null,
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
  },
  failedLoginAttempts: { type: Number, default: 0 },
  mustChangePassword: { type: Boolean, default: false },
}, { timestamps: true });

// Use the systemDB connection (erp-system database)
module.exports = getSystemDB().model('User', userSchema);