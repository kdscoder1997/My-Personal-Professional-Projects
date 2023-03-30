const express = require("express");
const router = express.Router();
const user = require("../Methods/userController");
const auth = require("../middleware/authentication"); //middleware for authentication of user
const { authorizePermissions } = require("../middleware/authentication");
router
  .route("/")
  .get(auth.authenticateUser, authorizePermissions("admin"), user.getAllUsers);
router.route("/showMe").get(auth.authenticateUser, user.showCurrentUser);
router.route("/updateUser").patch(auth.authenticateUser, user.updateUser);
router
  .route("/updateUserPassword")
  .patch(auth.authenticateUser, user.updateUserPassword);
router.route("/:id").get(auth.authenticateUser, user.getSingleUser);

module.exports = router;
