const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const routes = require("./modules/routes");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  });
});

app.get("/api/v1", (req, res) => {
  res.json({ message: "Welcome to the Example API" });
});

app.use("/api/v1", routes());

app.use((req, res, next) => {
  res.status(404).json({
    error: "Not found",
    message: "Route not found",
  });
});

module.exports = { app };
