const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.get('/', (req, res) => {
  res.json({ message: 'Server running.' });
})

app.listen(3000);
console.log('Server is running on http://localhost:3000');