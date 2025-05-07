// Main backend server file
const connectDb = require('./config/db');
require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const express = require('express');
const path = require('path');

//Addition of controllers
const authRoute = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //Added extended true to get neat & clean java objects from arrays
app.use(cors()); // Allow requests from frontend as both had different port.

app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Server running.' });
})
//  Uncomment it
// Provide the location of files to browser like index.html, logo.png, main.js etc.
// app.use(express.static(path.join(__dirname, '../client/build')));


app.use('/api', authRoute); // routes start with /api
// Uncomment it as it is requred.
// For all other pages just get index.html. Everything else will be handeled by React.
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build/index.html'));
// });

// registers the function into Express’s internal middleware system.
app.use(errorHandler);

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});