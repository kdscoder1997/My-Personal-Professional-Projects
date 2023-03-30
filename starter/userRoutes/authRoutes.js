const express = require("express");
const router = express.Router();
const auth = require("../Methods/authController");

router.route("/register").post(auth.register);
router.route("/login").post(auth.login);
router.route("/logout").get(auth.logout);

module.exports = router;
