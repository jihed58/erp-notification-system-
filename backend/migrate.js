/**
 * Migration script: copy system collections from erp-notif → erp-system
 * Collections migrated: users, alertrules, notificationlogs
 * Run once with: node migrate.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const SOURCE_URI = 'mongodb://localhost:27017/erp-notif';   // old single DB
const TARGET_URI = 'mongodb://localhost:27017/erp-system';  // new system DB

const SYSTEM_COLLECTIONS = ['users', 'alertrules', 'notificationlogs'];

async function migrate() {
  const sourceClient = new MongoClient(SOURCE_URI);
  const targetClient = new MongoClient(TARGET_URI);

  try {
    await sourceClient.connect();
    await targetClient.connect();

    const sourceDB = sourceClient.db();
    const targetDB = targetClient.db();

    console.log('\n🔄 Starting migration: erp-notif → erp-system\n');

    for (const collName of SYSTEM_COLLECTIONS) {
      const sourceColl = sourceDB.collection(collName);
      const targetColl = targetDB.collection(collName);

      const docs = await sourceColl.find({}).toArray();

      if (docs.length === 0) {
        console.log(`⚠️  [${collName}] No documents found – skipping.`);
        continue;
      }

      // Drop target collection first to avoid duplicates on re-run
      await targetColl.drop().catch(() => {}); // ignore error if doesn't exist

      await targetColl.insertMany(docs);
      console.log(`✅ [${collName}] Migrated ${docs.length} document(s).`);
    }

    console.log('\n🎉 Migration complete! System collections are now in erp-system.\n');
    console.log('📌 NOTE: The original collections in erp-notif are still there.');
    console.log('   You can delete them manually once you confirm everything works:\n');
    SYSTEM_COLLECTIONS.forEach(c => console.log(`   db.getSiblingDB("erp-notif").${c}.drop()`));
    console.log('');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await sourceClient.close();
    await targetClient.close();
  }
}

migrate();
