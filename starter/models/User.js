const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide email"],
    validator: {
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

userSchema.pre("save", async function (next) {
  // console.log(this.modifiedpaths()); //will return only values which have been modified
  // console.log(this.isModified('name'));   //will return boolean value if 'name' property of user has been modified
  if (this.isModified("password")) {
    //check if password has been modified
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } else return;
});

userSchema.methods.comparePassword = async (pass, userPass) => {
  const result = await bcrypt.compare(pass, userPass);
  return result;
};

userSchema.methods.createJWTToken = function () {
  // console.log(process.env.JWT_LIFETIME);
  const token = jwt.sign(
    {
      userId: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SIGN,
    { expiresIn: process.env.JWT_LIFETIME }
  );
  return token;
};
module.exports = mongoose.model("User", userSchema);
