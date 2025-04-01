const { Router } = require("express");

const auth = require("./auth/auth.route");

const routes = () => {
  const router = Router();

  router.use("/auth", auth);

  return router;
};

module.exports = routes;
