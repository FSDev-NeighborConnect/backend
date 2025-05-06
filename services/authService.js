// Authentication logic to be used by controllers
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function hashPassword(password) {
  return await bcrypt.hash(password, 10); // hashes with 10 salt rounds
}

async function comparePassword(input, passHash) {
  return await bcrypt.compare(input, passHash); // checks if input matches password hash in DB, return bool 
}

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '6h' });
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken
};