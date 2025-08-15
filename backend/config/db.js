// backend/config/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'admin', // Sesuaikan dengan username MySQL Anda
  password: 'SuperSecretPassword!123', // Sesuaikan dengan password MySQL Anda
  database: 'lesson_manager' // Sesuaikan dengan nama database Anda
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the MySQL database.');
});

module.exports = db;