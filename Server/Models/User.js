const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  resetPasswordExpiration: { type: Date, default: null },
});

const UserModel = mongoose.model("users", userSchema);
module.exports = UserModel;
