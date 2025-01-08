const express = require("express");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

require("dotenv").config(); // To load email credentials from .env file
// Your User Model

const UserModel = require("../Models/User"); // Import your User model
const {
  signupvalidation,
  loginvalidation,
} = require("../Middleware/AuthValidation");
const { signup, login } = require("../Controllers/AuthController");
const ensureAuthenticated = require("../Middleware/Auth"); // Middleware to check token

const router = express.Router();

// Route for user signup
router.post("/signup", signupvalidation, signup);

// Route for user login
router.post("/login", loginvalidation, login);

// Route to fetch username
router.get("/get-user", ensureAuthenticated, (req, res) => {
  UserModel.findById(req.user._id)
    .then((user) => {
      res.json({ username: user.username, name: user.name });
    })
    .catch(() => {
      res.status(400).json({ error: "User not found" });
    });
});

// Route for creating a wallet
router.post("/create-wallet", (req, res) => {
  const { username, publicKey, privateKey } = req.body;

  // Store wallet details in DB (implement securely)
  res.status(200).json({
    success: true,
    message: "Wallet created successfully!",
  });
});

// Generate a timestamp for 5 minutes in the future
const generateExpiryTimestamp = () => new Date(Date.now() + 5 * 60 * 1000);

// Route: Forgot Password (Request Password Reset)
router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  // Find the user by email
  UserModel.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      // Set an expiration time for the password reset link
      const resetExpiry = generateExpiryTimestamp();
      user.resetPasswordExpiration = resetExpiry;
      user.save();

      // Generate a password reset link with the user ID
      const resetLink = `http://localhost:5173/reset-password/${user._id}`;

      // Create the email transport
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Define email options
      let mailOptions = {
        from: "securapay@gmail.com", // Sender email
        to: email, // Recipient email
        subject: "Password Reset Request",
        text: `Hi there,

We received a request to reset your password. If you did not request this, please ignore this email.

To reset your password, please click the link below (valid for 5 minutes):

${resetLink}

If you have any questions, feel free to reach out to our support team.

Best regards,  
The Secura Pay Team`,
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ error: "Failed to send reset email" });
        }
        console.log("Email sent:", info);
        res.status(200).json({ message: "Password reset email sent" });
      });
    })
    .catch((err) => {
      res.status(500).json({ error: "Server error" });
    });
});

// Route: Reset Password
router.post("/reset-password/:userId", async (req, res) => {
  const { userId } = req.params; // Extract userId from the URL
  const { newPassword } = req.body; // Extract new password from the request body

  if (!userId || !newPassword) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    // Find user by userId
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the reset link is still valid
    if (
      !user.resetPasswordExpiration ||
      new Date() > user.resetPasswordExpiration
    ) {
      return res.status(400).json({
        message: "Reset link expired",
        redirect: "/",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password and clear reset-related fields
    user.password = hashedPassword;
    user.resetPasswordExpiration = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
