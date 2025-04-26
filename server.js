require('dotenv').config();
const PORT = process.env.PORT;
const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.get('/', (req, res) => {
  res.json({ message: 'Server running.' });
})

app.listen(PORT, () => {
  console.log('Server is running on http://localhost:' + PORT);
});