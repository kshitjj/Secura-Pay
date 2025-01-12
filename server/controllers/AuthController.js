const UserModel = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const { name, username, email, password, phone } = req.body;

    // Check if the user already exists
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(409).json({
        message: "User already exists, You can Login",
        success: false,
      });
    }

    // Create a new user
    const userModel = new UserModel({ name, username, email, password, phone });

    // Hash the password before saving
    userModel.password = await bcrypt.hash(password, 10);

    // Save the user to the database
    await userModel.save();

    // Return success response
    return res.status(201).json({
      message: "Signup successful",
      success: true,
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message, // Provide the error message in the response for easier debugging
    });
  }
};

//login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    const errorMsg = "Invalid credentials"; // More generic error message

    if (!user) {
      return res.status(403).json({
        message: errorMsg,
        success: false,
      });
    }

    // Check if the user's email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email address before logging in.",
        success: false,
      });
    }

    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      return res.status(403).json({
        message: errorMsg,
        success: false,
      });
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET, // Ensure the correct environment variable name here
      { expiresIn: "10m" } // Adjust expiry as needed
    );

    // Return success response
    res.status(200).json({
      message: "Login successful",
      success: true,
      jwtToken,
      email,
      name: user.name,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  signup,
  login,
};
