const express = require("express");
//const mysql = require('mysql2/promise');
require("dotenv").config();


// async function startServer() {
//   try {
//     const pool = mysql.createPool(process.env.MYSQL_DB);

//     const [users] = await pool.query('SELECT * FROM users');
//     console.log(users);

//   } catch (err) {ftcft
//     console.error(err);
//   }
// }

// startServer();

const app = express();
app.use(express.json());



app.use("/api/auth", require("./routes/auth"));


app.listen(3000, "0.0.0.0", () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
