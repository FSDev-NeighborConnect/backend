require('dotenv').config()
const mongoose = require('mongoose');

const uri = process.env.CONNECTION_URL
const clientOptions = { dbName: 'FSNeighborConnect', serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function connectDb() {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    // Shuts down server if error occurs
    console.log(err)
    process.exit(1)
  }
}

module.exports = connectDb;