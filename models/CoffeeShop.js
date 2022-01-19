const mongoose = require("mongoose");
const Joi = require("joi");

const CoffeeShopSchema = new mongoose.Schema({
  name: String,
  image: String,
  follows: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  reviews: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Review",
    },
  ],
  cities: [
    {
      type: mongoose.Types.ObjectId,
      ref: "City",
    },
  ],
});

const AddCoffeeJoi = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  image: Joi.string().uri().min(6).max(2000).required(),
  cities: Joi.array().items(Joi.objectid()).min(1),
});

const CoffeeEidtJoi = Joi.object({
  name: Joi.string().min(2).max(100),
  image: Joi.string().uri().min(6).max(2000),
  cities: Joi.array().items(Joi.objectid()).min(1),
});

const CoffeeShop = mongoose.model("CoffeeShop", CoffeeShopSchema);

module.exports.CoffeeShop = CoffeeShop;
module.exports.AddCoffeeJoi = AddCoffeeJoi;
module.exports.CoffeeEidtJoi = CoffeeEidtJoi;
