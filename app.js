require("dotenv").config();
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const chalk = require("chalk");
const connectToDB = require("./src/config/db");

const app = express();

// Menghubungkan ke MongoDB
connectToDB();

// Middlewares
app.use(express.json());
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
  app.use(cors({ origin: "https://mernuas.netlify.app" }));
} else {
  app.use(morgan("dev"));
  app.use(cors({ origin: "http://localhost:3000" }));
}

// Root Endpoint
app.get("/", (req, res) => {
  fs.readFile(__dirname + "/src/html/index.html", (err, data) => {
    res.set("Content-Type", "text/html");
    // Jika file tidak ditemukan
    if (err) {
      res.write(`<title>${process.env.APP_NAME}</title>`);
      res.write(`<h1>${process.env.APP_NAME} - MERN Ultimate Auth System</h1>`);
      res.write(`<p>Read API Documentation: <a href="#">Doc</a></p>`);
      res.end();
    } else {
      res.write(data);
      res.end();
    }
  });
});

// Primary Endpoint
app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/user", require("./src/routes/user"));

// 404 Endpoint
app.use("/", (req, res) => {
  res.status(404).send("404 Not Found");
});

// Running Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(
    `Server started on port ${PORT} with ${process.env.NODE_ENV} environment`
  );
  console.log(chalk`Visit {rgb(128, 237, 153) http://localhost:${PORT}}`);
  console.log(chalk`Developed by {rgb(255, 92, 88) Andry Pebrianto}`);
});
