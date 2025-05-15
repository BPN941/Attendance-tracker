const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const attendanceRoutes = require("./routes/attendanceRoutes");
const connectDB = require("./db");

const app = express();
const PORT = 3000;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(bodyParser.json());
app.use("/api", attendanceRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
