const express = require("express");
const validateBody = require("../middleware/validateBody");
const checkToken = require("../middleware/checkToken");
const checkId = require("../middleware/checkId");
const { Review, AddReviweJoi } = require("../models/Reviwe");
const { CoffeeShop } = require("../models/CoffeeShop");
const { User } = require("../models/User");
const router = express.Router();

/////.....................get reviwes.............................
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().populate("coffeeShop");

    res.json(reviews);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

/////.....................add reviwes.............................

router.post(
  "/:cafeid/review",
  checkToken,
  validateBody(AddReviweJoi),
  async (req, res) => {
    try {
      const {
        currentemployee,
        reviewheadline,
        lastYearatEmployer,
        location,
        ratingWorkLife,
        ratingValues,
        ratingDiversity,
        ratingBenefits,
        employmentStatus,
        pros,
        cons,
        advice,
        recommend,
        businessOutlook,
        lengthofEmployment,
      } = req.body;

      let ratingSum =
        ratingWorkLife + ratingValues + ratingDiversity + ratingBenefits;
      const ratingAverage = ratingSum / 4;

      const review = new Review({
        currentemployee,
        reviewheadline,
        lastYearatEmployer,
        coffeeShop: req.params.cafeid,
        location,
        ratingAverage,
        ratingWorkLife,
        ratingValues,
        ratingDiversity,
        ratingBenefits,
        employmentStatus,
        pros,
        cons,
        advice,
        recommend,
        businessOutlook,
        lengthofEmployment,
        user: req.userId,
      });

      await review.save();
      await CoffeeShop.findByIdAndUpdate(req.params.cafeid, {
        $push: { reviews: review._id },
      });
      await User.findByIdAndUpdate(req.userId, {
        $push: { reviews: review._id },
      });
      res.json(review);
    } catch (error) {
      console.log(error);
      res.status(500).send(error.message);
    }
  }
);

//.............................................delelte review.........................................
router.delete("/:id", checkToken, checkId, async (req, res) => {
  try {
    const review = await Review.findByIdAndRemove(req.params.id);
    if (!review) return res.status(404).send("review not found");
    await CoffeeShop.findByIdAndUpdate(req.params.id, {
      $pull: { reviews: review._id },
    });
    await User.findByIdAndUpdate(req.userId, {
      $pull: { reviews: review._id },
    });
    res.json("review is removed");
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
