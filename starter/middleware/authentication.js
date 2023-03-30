const jwt = require("jsonwebtoken");
const errors = require("../errors");

//Here we are checking if user has logged in via checking if token is present or not. Then verifying token with jwt_sign, then filling the req.user with user values from token
async function authenticateUser(req, res, next) {
  const token = req.signedCookies.token;
  // console.log(token);
  if (token) {
    // console.log(token);

    try {
      const payload = await jwt.verify(token, process.env.JWT_SIGN); //verifying token
      req.user = {
        name: payload.name,
        userId: payload.userId,
        role: payload.role,
      }; //filling req.user with values
      // console.log(req.user);
      next();
    } catch (error) {
      throw new errors.UnauthenticatedError("Authentication failed");
    }
  } else throw new errors.UnauthenticatedError("Authentication invalid"); //If token not present
}

// middleware to allow only specific user to access the specific routes
function authorizePermissions(...roles) {
  //accepts roles passed from calling function(userRoutes.js)   //rest operator -> to except dynamic number of parameters
  return async (req, res, next) => {
    if (roles.includes(req.user.role)) next();
    else
      throw new errors.UnauthorizedError(`Unauthorized to access this route`);
  };
}

module.exports = { authenticateUser, authorizePermissions };
