const User = require("../models/User");
const codes = require("http-status-codes");
const { use } = require("express/lib/router");
const errors = require("../errors");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  let role; // = "admin";

  //set first user to admin
  if ((await User.countDocuments({})) === 0) role = "admin";
  else role = "user";

  //Find duplicate entry
  const findDuplicateEmail = await User.findOne({ email });
  if (findDuplicateEmail)
    throw new errors.BadRequestError(
      "Email already exist. Please provide another email."
    );
  //create User
  const user = await User.create({ name, email, password, role });

  //create Token
  const token = user.createJWTToken();
  //attaching cookies
  attachCookiesToResponse(res, token);

  res.status(codes.StatusCodes.OK).json({
    user: { name: user.name, userId: user._id, role: user.role },
    // token,
  });
};

const login = async (req, res) => {
  if (req.body.email && req.body.password) {
    let email = req.body.email;

    const user = await User.findOne({ email });
    if (user) {
      //comparePassword);
      const comparePassword = await user.comparePassword(
        req.body.password,
        user.password
      );
      //comparePassword);
      if (comparePassword) {
        const token = await user.createJWTToken();
        attachCookiesToResponse(res, token);
        res.status(codes.StatusCodes.OK).json({
          user: { name: user.name, userId: user._id, role: user.role },
        });
      } else throw new errors.UnauthenticatedError("Wrong Password.");
    } else throw new errors.NotFoundError(`No user with ${email} email found.`);
  } else throw new errors.BadRequestError("Please provide credentials");

  // res.send(`Login`);
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(codes.StatusCodes.OK).json({ msg: `User logged out!` });
};

function attachCookiesToResponse(res, userToken) {
  const oneDay = 1000 * 60 * 60 * 24;
  let result = false; //as we are in development
  if (process.env.NODE_ENV === "production") result = true; //if will not work bcz we are in development
  res.cookie("token", userToken, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: result, //secure restricts browser to use only https to send cookies. Here we have applied logic as-> if we are production use https only else not (for eg.- in development)
    signed: true, // This signs the cookie for extra security
  }); // res.cookie('name', data, {options})  httpOnly -> only browser can access
}

module.exports = { register, login, logout };
