const { Router } = require("express");

const { getUserController, getUsersController } = require("./user.controller");

const router = Router();

router.get("/", getUsersController);
router.get("/:id", getUserController);

module.exports = router;
