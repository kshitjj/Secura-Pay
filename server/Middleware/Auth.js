const jwt = require("jsonwebtoken");

const ensureAuthenticated = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(403).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1]; // Extract token from Bearer <token>
  if (!token) {
    return res.status(403).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifies if the token is valid and not expired
    req.user = decoded; // Store decoded user information in req.user
    next();
  } catch (err) {
    // Handle token expiration and invalid token
    return res
      .status(403)
      .json({ message: "Token expired or invalid, please login again" });
  }
};

module.exports = ensureAuthenticated;
