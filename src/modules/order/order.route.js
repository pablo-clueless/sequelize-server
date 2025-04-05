const { Router } = require("express");

const middleware = require("../../common/middleware/auth");
const {
  createOrderController,
  deleteOrderController,
  getOrderController,
  getOrdersController,
  updateOrderController,
} = require("./order.controller");

const router = Router();

router.post("/create", middleware, createOrderController);
router.get("/", middleware, getOrdersController);
router.get("/:id", middleware, getOrderController);
router.put("/:id", middleware, updateOrderController);
router.delete("/:id", middleware, deleteOrderController);

module.exports = router;
