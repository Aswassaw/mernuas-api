const express = require("express");

const app = express();

app.use("/", (req, res) => {
  res.send("Server Running");
});

app.listen(5000, () => {
  console.log("Running");
});
