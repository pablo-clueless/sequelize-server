const { Router } = require("express");

const tracking = require("./tracking/tracking.route");
const orders = require("./order/order.route");
const users = require("./user/user.route");
const auth = require("./auth/auth.route");

const routes = () => {
  const router = Router();

  router.use("/auth", auth);
  router.use("/users", users);
  router.use("/orders", orders);
  router.use("/tracking", tracking);

  return router;
};

module.exports = routes;
