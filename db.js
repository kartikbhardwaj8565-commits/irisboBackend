const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool(process.env.MYSQL_DB);

module.exports = pool;
