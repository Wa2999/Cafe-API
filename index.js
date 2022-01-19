const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const Joi = require("joi");
const JoiObjectId = require("joi-objectid");
Joi.objectid = JoiObjectId(Joi);
const users = require("./routes/users");
const cites = require("./routes/cities");
const coffeeShop = require("./routes/coffeeShopes");
const reviews = require("./routes/reviews");

//..........................connect to mongoose....................................
mongoose
  .connect(`mongodb+srv://cafeDB:${process.env.MANGODB_PASSWORD}@cluster0.h2i6u.mongodb.net/cafeDB?retryWrites=true&w=majority`)
  .then(() => {
    console.log("Connected to mongoDB");
  })
  .catch((error) => {
    console.log("error connecting to mongoDB", error);
  });

//................................app use....................................

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/auth", users);
app.use("/api/cities", cites);
app.use("/api/review", reviews);
app.use("/api/coffeeShop", coffeeShop);

//...........................server...........................................

const port = 5000;
app.listen(process.env.PORT || port, () => console.log("server is listening on port " + port));
