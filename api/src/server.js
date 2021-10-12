require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const chalk = require("chalk");

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(compression());
app.use(helmet());

// Root Endpoint
app.get("/", (req, res) => {
  res.send("MERN Ultimate Auth");
});

// Running Server
const PORT = process.env.API_PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(chalk`Visit {rgb(128, 237, 153) http://localhost:${PORT}}`);
  console.log(chalk`Developed by {rgb(255, 92, 88) Andry Pebrianto}`);
});
