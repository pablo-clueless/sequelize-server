require("dotenv").config();

const { sequelize } = require("./sql");
const { app } = require("./app");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync();
      console.log("Database models synchronized.");
    }

    app.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
}

startServer();

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  if (process.env.NODE_ENV === "development") {
    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Shutting down gracefully...");
  try {
    await sequelize.close();
    console.log("Database connections closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});
