// Authentication logic to be used by controllers
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  return await bcrypt.hash(password, 10); // hashes with 10 salt rounds
}

async function comparePassword(input, passHash) {
  return await bcrypt.compare(input, passHash); // checks if input matches password hash in DB, return bool 

}

module.exports = { hashPassword, comparePassword };