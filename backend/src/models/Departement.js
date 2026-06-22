const mongoose = require('mongoose');

// Read-only model pointing to the `departement` collection in erp-notif DB
const departementSchema = new mongoose.Schema({
  idDepartement: Number,
  departement: String,
  code: String,
  etat: Number,
}, { collection: 'departement' });

module.exports = mongoose.model('Departement', departementSchema);
