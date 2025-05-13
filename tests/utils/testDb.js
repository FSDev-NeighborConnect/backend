const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

async function clearDB() {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany();
  }
}

async function teardownTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
}

module.exports = { setupTestDB, teardownTestDB, clearDB };
