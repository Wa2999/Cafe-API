const mongoose = require("mongoose");
const Joi = require("joi");

const CitySchema = new mongoose.Schema({
  nameOfCity: String,
  image: String,

  coffeeshopes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "CoffeeShop",
    },
  ],
});

const AddCityJoi = Joi.object({
  nameOfCity: Joi.string().min(2).max(100).required(),
  image: Joi.string().uri().min(6).max(1000).required(),
  coffeeshopes: Joi.array().items(Joi.objectid()).min(1).required(),
});

const cityEditJoi = Joi.object({
  nameOfCity: Joi.string().min(2).max(100),
  image: Joi.string().uri().min(6).max(1000),
  coffeeshopes: Joi.array().items(Joi.objectid()).min(0),
});
const City = mongoose.model("City", CitySchema);

module.exports.City = City;
module.exports.AddCityJoi = AddCityJoi;
module.exports.cityEditJoi = cityEditJoi;
