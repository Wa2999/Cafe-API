const express = require("express");
const validateBody = require("../middleware/validateBody");
const checkToken = require("../middleware/checkToken");
const checkAdmin = require("../middleware/checkAdmin");
const validateId = require("../middleware/validateId");
const {
  CoffeeShop,
  CoffeeEidtJoi,
  AddCoffeeJoi,
} = require("../models/CoffeeShop");
const { User } = require("../models/User");
const checkId = require("../middleware/checkId");
const router = express.Router();

/////.....................get coffeeshop.............................
router.get("/", async (req, res) => {
  try {
    const coffeeShopes = await CoffeeShop.find().populate({
      path: "follows",
      select: "-password -email -avatar -review -follows  -role",
    }).populate({
      path:"reviews",
      populate:{
        path:"user",
        select:"firstName lastName"
    }}).populate({
      path:"reviews",
      populate:{
        path:"coffeeShop",
        select:"name"
    }})

    res.json(coffeeShopes);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

//...........................getcoffeebyid.........................
router.get("/:id", checkId, async (req, res) => {
  try {
    const coffeeShop = await CoffeeShop.findById(req.params.id);

    if (!coffeeShop) return res.status(404).send("coffeeShop not found");

    res.json(coffeeShop);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

/////.....................add coffeeShop.............................

router.post("/", checkAdmin, validateBody(AddCoffeeJoi), async (req, res) => {
  try {
    const { name, image, cities } = req.body;

    const coffeeShop = new CoffeeShop({
      name,
      image,
      cities,
    });

    await coffeeShop.save();

    res.json(coffeeShop);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});
//---------------------------------edit coffeeShop----------------------------------------------------
router.put(
  "/:id",
  checkToken,
  checkId,
  validateBody(CoffeeEidtJoi),
  async (req, res) => {
    try {
      const { name, image, cities } = req.body;

      const coffeeshop = await CoffeeShop.findByIdAndUpdate(
        req.params.id,
        { $set: { name, image, cities } },
        { new: true }
      );
      if (!coffeeshop) return res.status(404).send("coffeeshop not found");

      res.json(coffeeshop);
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }
);

//.............................................delelte coffeeshop.........................................
router.delete("/:id", checkAdmin, checkId, async (req, res) => {
  try {
    const coffeeshop = await CoffeeShop.findByIdAndRemove(req.params.id);
    if (!coffeeshop) return res.status(404).send("coffeeshop not found");
    res.json("coffeeshop is removed");
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});
//.............................................follows...................................................
router.get(
  "/:coffeeshopId/follows",
  checkToken,
  validateId("coffeeshopId"),
  async (req, res) => {
    try {
      let coffeeshop = await CoffeeShop.findById(req.params.coffeeshopId);
      if (!coffeeshop) return res.status(404).send("coffeeShop not found");

      const userFound = coffeeshop.follows.find(
        (follow) => follow == req.userId
      );
      if (userFound) {
        await CoffeeShop.findByIdAndUpdate(req.params.coffeeshopId, {
          $pull: { follows: req.userId },
        });
        await User.findByIdAndUpdate(req.userId, {
          $pull: { follows: req.params.coffeeshopId },
        });

        res.send("removed follow from coffeeshop");
      } else {
        await CoffeeShop.findByIdAndUpdate(req.params.coffeeshopId, {
          $push: { follows: req.userId },
        });
        await User.findByIdAndUpdate(req.userId, {
          $push: { follows: req.params.coffeeshopId },
        });
        res.send("followd");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }
);
module.exports = router;
