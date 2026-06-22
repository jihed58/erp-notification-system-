const { getErpDataDB } = require('../config/db');

const mongoose = require('mongoose');

// Points to the `employe` collection in erp-notif (ERP data database – read-only)
const employeSchema = new mongoose.Schema({
  idEmploye: Number,
  nom: String,
  prenom: String,
  matricule: Number,
  etat: Number,
}, { collection: 'employe' });

module.exports = getErpDataDB().model('Employe', employeSchema);
