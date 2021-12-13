require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const chalk = require("chalk");
const connectToDB = require("./v1/config/db");

const app = express();

// Menghubungkan ke MongoDB
connectToDB();

// Middlewares
app.use(express.json());
app.use(compression());
app.use(helmet());
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
  app.use(cors({ origin: "https://mernuas.netlify.app" }));
} else {
  app.use(morgan("dev"));
  app.use(cors({ origin: "http://localhost:3000" }));
}

// Root Endpoint
app.get("/", (req, res) => {
  res.send("Mernuas - MERN Ultimate Auth System");
});

// Endpoint (v1)
app.use("/api/v1/auth", require("./v1/routes/auth"));

// 404 Endpoint
app.use("/", (req, res) => {
  res.status(404).send("404 Not Found");
});

// Running Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT} with ${process.env.NODE_ENV} environment`);
  console.log(chalk`Visit {rgb(128, 237, 153) http://localhost:${PORT}}`);
  console.log(chalk`Developed by {rgb(255, 92, 88) Andry Pebrianto}`);
});
