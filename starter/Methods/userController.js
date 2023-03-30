const User = require("../models/User");
const codes = require("http-status-codes");
const errors = require("../errors");

async function getAllUsers(req, res) {
  //by admin only
  const users = await User.find({ role: "user" }).select("-password"); //get everything except password
  if (users) res.status(codes.StatusCodes.OK).json({ users });
  else throw new errors.NotFoundError("No users found.");
}

async function getSingleUser(req, res) {
  //by admin and the user who has logged in itself
  const id = req.params.id;
  // console.log(req.user.role === "admin" || req.user.userId === req.params.id);

  // checking for permissions (if admin or is same user)
  if (req.user.role === "admin" || req.user.userId === req.params.id) {
    //check permissions
    const user = await User.find({ _id: id }).select("-password");
    if (user) res.status(codes.StatusCodes.OK).json({ user });
    else throw new errors.NotFoundError(`User with id : ${id} not found`);
  } else
    throw new errors.UnauthorizedError("Unauthorized to access this route");
}

async function showCurrentUser(req, res) {
  //by all
  // console.log(req.user);
  res.status(codes.StatusCodes.OK).json({ user: req.user });
}

async function updateUser(req, res) {
  if (req.body.name && req.body.email) {
    const user = await User.findOne({ _id: req.user.userId });
    // console.log(req.body.email === user.email);
    if (req.body.email === user.email) {
      user.name = req.body.name;
      user.save(); //evokes user.pre('save') method but will not hash the password once again
      const tokenUser = { name: user.name, userId: user._id, role: user.role };
      const token = await user.createJWTToken();
      attachCookiesToResponse(res, token);
      res
        .status(codes.StatusCodes.OK)
        .json({ msg: `Changes made successfully!`, user: tokenUser });
    } else {
      const findUser = await User.findOne({ email: req.body.email }); //checking for duplicate error
      // console.log(findUser);
      // console.log(findUser !== null);

      if (findUser !== null) {
        //if duplicate email(entered by user) is found in database
        throw new errors.BadRequestError(
          "Email already exists! Please provide another email"
        );
      }
      user.name = req.body.name;
      user.email = req.body.email;
      user.save(); //evokes user.pre('save') method but will not hash the password once again
      const tokenUser = { name: user.name, userId: user._id, role: user.role };
      const token = await user.createJWTToken();
      attachCookiesToResponse(res, token);
      res
        .status(codes.StatusCodes.OK)
        .json({ msg: `Changes made successfully!`, user: tokenUser });
    }
  } else
    throw new errors.BadRequestError("Please provide both name and email.");
}

async function updateUserPassword(req, res) {
  if (req.body.oldPassword && req.body.newPassword) {
    const user = await User.findOne({ _id: req.user.userId });
    const comparePassword = await user.comparePassword(
      req.body.oldPassword,
      user.password
    );
    if (comparePassword) {
      user.password = req.body.newPassword;
      user.save(); //evokes user.pre('save') method and hashes the password once again
      res
        .status(codes.StatusCodes.OK)
        .json({ msg: `Password changed successfully!` });
    } else
      throw new errors.UnauthenticatedError(
        "Old password does not match, please provide valid credentials"
      );
  } else
    throw new errors.BadRequestError(
      "Please provide both old and new password."
    );
}

function attachCookiesToResponse(res, userToken) {
  const oneDay = 1000 * 60 * 60 * 24;
  let result = false;
  if (process.env.NODE_ENV === "production") result = true;
  res.cookie("token", userToken, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: result,
    signed: true,
  });
}

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
