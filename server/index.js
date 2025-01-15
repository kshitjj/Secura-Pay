const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const AuthRouter = require("./routes/AuthRouter");
const ProductRouter = require("./routes/ProductRouter");
require("dotenv").config();
require("./models/db");

const app = express();
const PORT = process.env.PORT || 8080;

// Import the cron job for user cleanup
require("./corn_job/UserCleanup"); // Adjust the path based on your file structure

app.get("/ping", (req, res) => {
  res.send("PONG");
});

app.use(bodyParser.json());
app.use(cors());
app.use("/auth", AuthRouter);
app.use("/products", ProductRouter);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
