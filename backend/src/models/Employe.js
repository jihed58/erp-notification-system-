const mongoose = require('mongoose');

// Read-only model pointing to the `employe` collection in erp-notif DB
const employeSchema = new mongoose.Schema({
  idEmploye: Number,
  nom: String,
  prenom: String,
  matricule: Number,
  etat: Number,
}, { collection: 'employe' });

module.exports = mongoose.model('Employe', employeSchema);
