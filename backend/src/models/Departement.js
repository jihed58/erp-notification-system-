const { getErpDataDB } = require('../config/db');

const mongoose = require('mongoose');

// Points to the `departement` collection in erp-notif (ERP data database – read-only)
const departementSchema = new mongoose.Schema({
  idDepartement: Number,
  departement: String,
  code: String,
  etat: Number,
}, { collection: 'departement' });

module.exports = getErpDataDB().model('Departement', departementSchema);
