const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
// Two separate MongoDB connections:
//   systemDB  → erp-system  (users, alert rules, notification logs)
//   erpDataDB → erp-notif   (employees, stock, clients, etc. – read-only)
// ─────────────────────────────────────────────────────────────────────────────

let systemDB = null;
let erpDataDB = null;

const connectDB = async () => {
  try {
    // 1️⃣  System database (authentication, alert rules, notifications)
    systemDB = await mongoose.createConnection(process.env.MONGODB_SYSTEM_URI).asPromise();
    console.log(`✅ System DB connected → ${process.env.MONGODB_SYSTEM_URI}`);

    // 2️⃣  ERP data database (employees, stock, clients … – read-only)
    erpDataDB = await mongoose.createConnection(process.env.MONGODB_ERP_URI).asPromise();
    console.log(`✅ ERP Data DB connected → ${process.env.MONGODB_ERP_URI}`);

  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const getSystemDB  = () => systemDB;
const getErpDataDB = () => erpDataDB;

module.exports = { connectDB, getSystemDB, getErpDataDB };