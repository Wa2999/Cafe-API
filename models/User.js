const mongoose = require("mongoose");
const Joi = require("joi");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  avatar: {type:String,
    default:"https://as1.ftcdn.net/v2/jpg/03/46/83/96/1000_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg"},
  // emailVerified: Boolean,
  reviews: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Review",
    },
  ],
  follows: [
    {
      type: mongoose.Types.ObjectId,
      ref: "CoffeeShop",
    },
  ],

  role: {
    type: String,
    enum: ["Admin", "User"],
    default: "User",
  },
});

const signupJoi = Joi.object({
  firstName: Joi.string().min(2).max(100).required(),
  lastName: Joi.string().min(2).max(100).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(100)
    .required(),
  password: Joi.string().min(6).max(100).required(),
  avatar: Joi.string().uri().min(6).max(1000).allow(""),
});

const loginJoi = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
});

const profileJoi = Joi.object({
  firstName: Joi.string().min(2).max(100),
  lastName: Joi.string().min(2).max(100),
  password: Joi.string().min(6).max(100).allow(""),
  avatar: Joi.string().uri().min(6).max(1000),
});
const User = mongoose.model("User", userSchema);

module.exports.User = User;
module.exports.signupJoi = signupJoi;
module.exports.loginJoi = loginJoi;
module.exports.profileJoi = profileJoi;
