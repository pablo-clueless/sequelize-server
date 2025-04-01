const { Router } = require("express");

const { loginController, registerController } = require("./auth.controller");

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);

module.exports = router;
