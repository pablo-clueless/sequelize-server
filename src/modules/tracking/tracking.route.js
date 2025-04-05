const { Router } = require("express");

const middleware = require("../../common/middleware/auth");
const {
  addTrackingHistoryController,
  createTrackingController,
  getTrackingByIdController,
  getTrackingByNumberController,
  getTrackingByOrderIdController,
  getTrackingHistoryController,
  updateTrackingHistoryController,
} = require("./tracking.controller");

const router = Router();

router.post("/create", middleware, createTrackingController);
router.post("/add-history", middleware, addTrackingHistoryController);
router.get("/:trackingId", middleware, getTrackingByIdController);
router.get(
  "/number/:trackingNumber",
  middleware,
  getTrackingByNumberController,
);
router.get("/order/:orderId", middleware, getTrackingByOrderIdController);
router.get("/history", middleware, getTrackingHistoryController);
router.put("/:trackingId", middleware, updateTrackingHistoryController);

module.exports = router;
