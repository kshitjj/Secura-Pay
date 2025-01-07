const express = require("express");
const {
  signupvalidation,
  loginvalidation,
} = require("../Middleware/AuthValidation");
const { signup, login } = require("../Controllers/AuthController");
const UserModel = require("../Models/User"); // Import your User model
const ensureAuthenticated = require("../Middleware/Auth"); // Import the middleware that checks the token
const router = express.Router();

// Route for user signup
router.post("/signup", signupvalidation, signup);

// Route for user login
router.post("/login", loginvalidation, login);

// Route to fetch username (added functionality)
router.get("/get-user", ensureAuthenticated, (req, res) => {
  // Using the decoded user information from the token to fetch the user from DB
  UserModel.findById(req.user._id)
    .then((user) => {
      // Send the user's name as the response
      res.json({ username: user.username,name:user.name});
    })
    .catch((err) => {
      res.status(400).json({ error: "User not found" });
    });
});

router.post("/create-wallet", (req, res) => {
  const { username, publicKey, privateKey } = req.body;

  // You can now store the public and private keys in the database
  // Make sure to handle the private key securely, e.g., by encrypting it

  // Example response
  res.status(200).json({
    success: true,
    message: "Wallet created successfully!",
  });
});
module.exports = router;
