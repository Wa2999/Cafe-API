const mongoose = require("mongoose");
const Joi = require("joi");

////..............................ReviweSchema................................................................

const ReviweSchema = new mongoose.Schema({
  user: {
    ref: "User",
    type: mongoose.Types.ObjectId,
  },
  currentemployee: {
    type: Boolean,
    default: true,
  },
  reviewheadline: String,
  lastYearatEmployer: Number,
  coffeeShop: {
    type: mongoose.Types.ObjectId,
    ref: "CoffeeShop",
  },
  location: String,
  ratingAverage: Number,
  ratingWorkLife: Number,
  ratingValues: Number,
  ratingDiversity: Number,
  ratingBenefits: Number,
  employmentStatus: String,
  pros: String,
  cons: String,
  advice: String,
  recommend: {
    type: Boolean,
    default: false,
  },
  businessOutlook: {
    type: Boolean,
    default: false,
  },
  lengthofEmployment: Number,
});

///................................Add Reviwe Joi......................................
const AddReviweJoi = Joi.object({
  currentemployee: Joi.boolean().default(true).required(),
  reviewheadline: Joi.string().min(2).max(300).required(),
  lastYearatEmployer: Joi.number().min(2).max(3000),
  coffeeShop: Joi.objectid(),
  location: Joi.string().min(2).max(100).required(),

  ratingWorkLife: Joi.number().min(0).max(5).required(),
  ratingValues: Joi.number().min(0).max(5).required(),
  ratingDiversity: Joi.number().min(0).max(5).required(),
  ratingBenefits: Joi.number().min(0).max(5).required(),

  employmentStatus: Joi.string().min(2).max(100),
  pros: Joi.string().min(5).max(200).required(),
  cons: Joi.string().min(5).max(200).required(),
  advice: Joi.string().min(5).max(200),
  recommend: Joi.boolean().default(true).required(),
  businessOutlook: Joi.boolean().default(true).required(),
  LengthOfEmployment: Joi.number().min(0).max(70).required(),
});


const Review = mongoose.model("Review", ReviweSchema);

module.exports.Review = Review;
module.exports.AddReviweJoi = AddReviweJoi;
