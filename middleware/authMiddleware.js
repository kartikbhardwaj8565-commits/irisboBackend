const jwt = require("jsonwebtoken");
const pool = require("../db");

module.exports = async function authMiddleware(req, res, next) {
  try {
    // 🔍 Debug (you can remove later)
    console.log("Auth middleware triggered");

    // 1️⃣ Check Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid Authorization format" });
    }

    // 2️⃣ Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    console.log("Received Token:", token);

    // 3️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4️⃣ Check if token is blacklisted
    const [blacklisted] = await pool.query(
      "SELECT id FROM blacklisted_tokens WHERE token = ? LIMIT 1",
      [token]
    );

    if (blacklisted.length > 0) {
      return res.status(401).json({ message: "Token has been logged out" });
    }

    // 5️⃣ Attach decoded user info
    req.user = decoded;   // contains { id: user.id }
    req.token = token;

    next();

  } catch (err) {
    console.log("JWT ERROR NAME:", err.name);
    console.log("JWT ERROR MESSAGE:", err.message);

    return res.status(401).json({ message: err.message });

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token signature" });
    }

    return res.status(401).json({ message: "Authentication failed" });
  }
};
