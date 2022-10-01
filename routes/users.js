const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, loginJoi, signupJoi, profileJoi } = require("../models/User");
const validateBody = require("../middleware/validateBody");
const checkAdmin = require("../middleware/checkAdmin");
const checkToken = require("../middleware/checkToken");
const checkId = require("../middleware/checkId");
const { Review } = require("../models/Reviwe");
const nodemailer = require("nodemailer");
const router = express.Router();

//............................SIGNUP......................................................

router.post("/signup", validateBody(signupJoi), async (req, res) => {
  try {
    const { firstName, lastName, email, password, avatar } = req.body;

    const userFound = await User.findOne({ email });
    if (userFound) return res.status(400).send("user already registered");

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = new User({
      firstName,
      lastName,
      email,
      password: hash,
      avatar,
      // emailVerified: false,
      role: "User",
    });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "15d",
    });

    await transporter.sendMail({
      from: '"Confirm your account on CAFE" <wejdana299@gmail.com>',
      to: email,
      subject: "Email verification",
      html: `Hi there, plase click on this link to verify your email.
       <a href='http://localhost:3000/email_verified/${token}'> verify email</a>`,
    });
    await user.save();
    res.json("DONE");
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});
//....................................validate Email.......................
router.get("/verify_email/:token", async (req, res) => {
  try {
    const decryptedToken = jwt.verify(
      req.params.token,
      process.env.JWT_SECRET_KEY
    );
    const userId = decryptedToken.id;

    const user = await User.findByIdAndUpdate(userId, {
      $set: { emailVerified: true },
    });
    if (!user) return res.status(404).send("user not found");

    res.send("user verified");
  } catch (error) {
    res.status(500).send(error.message);
  }
});
//.........................................login.....................................................
router.post("/login", validateBody(loginJoi), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("user not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).send("password incorrect");

    if (!user.emailVerified)
      return res.status(403).send("user not verified,please check your email");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "15d",
    });

    res.send(token);
  } catch (error) {
    res.status(500).send(error.message);
  }
});
//............................Add-Admain.......................................
router.post(
  "/add-admin",
  checkAdmin,
  validateBody(signupJoi),
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, avatar } = req.body;

      const userFound = await User.findOne({ email });
      if (userFound) return res.status(400).send("user already registered");

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const user = new User({
        firstName,
        lastName,
        email,
        password: hash,
        avatar,
        role: "Admin",
      });

      await user.save();

      delete user._doc.password;

      res.json(user);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);
//....................................login Admin.......................................
router.post("/login/admin", validateBody(loginJoi), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("user not found");
    if (user.role != "Admin") return res.status(403).send("you are not admin");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).send("password incorrect");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "15d",
    });

    res.send(token);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//............................................... user............................................

router.get("/users", checkAdmin, async (req, res) => {
  const users = await User.find().select("-password -__v");
  res.json(users);
});

router.delete("/users/:id", checkAdmin, checkId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("user not found");

    if (user.role === "Admin")
      return res.status(403).send("unauthorized action");

    await User.findByIdAndRemove(req.params.id);

    await Review.deleteMany({ owner: req.params.id });

    res.send("user is deleted");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//.............................................get profile................................................................

router.get("/profile", checkToken, async (req, res) => {
  const user = await User.findById(req.userId)
    .select("-__v -password")
    .populate("follows")
    .populate({
      path: "reviews",
      populate: {
        path: "coffeeShop",
      },
    });
  res.json(user);
});

//............................edit profile................................................
router.put(
  "/profile",
  checkToken,
  validateBody(profileJoi),
  async (req, res) => {
    const { firstName, lastName, password, avatar } = req.body;

    let hash;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hash = await bcrypt.hash(password, salt);
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { firstName, lastName, password: hash, avatar } },
      { new: true }
    ).select("-__v -password");

    res.json(user);
  }
);
module.exports = router;
