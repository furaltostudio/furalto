/**
 * List Atlas databases (names + sizes only).
 * Run: node scripts/list-dbs.js
 */
require("dotenv").config();
const mongoose = require("mongoose");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const dbs = await mongoose.connection.db.admin().listDatabases();
  for (const db of dbs.databases) {
    console.log(`${db.name}\tsize=${db.sizeOnDisk}`);
  }
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error("ERR", error.message);
  process.exit(1);
});
