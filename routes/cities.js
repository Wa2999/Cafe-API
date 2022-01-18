const express = require("express");
const validateBody = require("../middleware/validateBody");
const checkAdmin = require("../middleware/checkAdmin");
const { City, AddCityJoi, cityEditJoi } = require("../models/City");
const checkId = require("../middleware/checkId");
const router = express.Router();

/////.....................get cities.............................
router.get("/", async (req, res) => {
  try {
    const cities = await City.find().populate({
      path: "coffeeshopes",
      populate: "reviews",
      // select: " -follows ",
    });

    res.json(cities);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

/////.....................add cities.............................

router.post("/", checkAdmin, validateBody(AddCityJoi), async (req, res) => {
  try {
    const { nameOfCity, image, coffeeshopes } = req.body;

    const city = new City({
      nameOfCity,
      image,
      coffeeshopes,
    });

    // const coffeeshopesSet = new Set(coffeeshopes);
    // if (coffeeshopesSet.size < coffeeshopes.length)
    //   return res.status(400).send("there is a duplicated coffeeshope");
    // const coffeeshopesFound = await City.find({ _id: { $in: coffeeshopes } });
    // if (coffeeshopesFound.length < coffeeshopes.length)
    //   return res.status(404).send("some of the coffeeshope is not found");

    await city.save();

    res.json(city);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});
//---------------------------------edit cities----------------------------------------------------
router.put(
  "/:id",
  checkAdmin,
  checkId,
  validateBody(cityEditJoi),
  async (req, res) => {
    try {
      const { nameOfCity, image, coffeeshopes } = req.body;

      // const coffeeshopesSet = new Set(coffeeshopes);
      // if (coffeeshopesSet.size < coffeeshopes.length)
      //   return res.status(400).send("there is a duplicated coffeeshope");
      // const coffeeshopesFound = await City.find({ _id: { $in: coffeeshopes } });
      // if (coffeeshopesFound.length < coffeeshopes.length)
      //   return res.status(404).send("some of the coffeeshope is not found");

      const city = await City.findByIdAndUpdate(
        req.params.id,
        { $set: { nameOfCity, image, coffeeshopes } },
        { new: true }
      );
      if (!city) return res.status(404).send("city not found");

      res.json(city);
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }
);

//.............................................delelte city.........................................
router.delete("/:id", checkAdmin, checkId, async (req, res) => {
  try {
    const city = await City.findByIdAndRemove(req.params.id);
    if (!city) return res.status(404).send("city not found");
    res.json("city is removed");
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});
module.exports = router;
