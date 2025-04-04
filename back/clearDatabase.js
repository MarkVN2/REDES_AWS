
const mysql = require("mysql2/promise");
mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
}).then(async (connection) => {
  await connection.query(`DROP DATABASE ${process.env.DB_NAME};`);
  await connection.query(`CREATE DATABASE ${process.env.DB_NAME};`);
  await connection.end();
})
