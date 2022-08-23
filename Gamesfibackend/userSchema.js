// const mongoose = require("mongoose");

// const mongoDB = "mongodb://127.0.0.1:27017/gamesfi";

// db = mongoose.connect(mongoDB);

const Joi = require("joi"); /// Data Validation

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(20).required(),
  name: Joi.string().alphanum().required(),
});

module.exports = userSchema;
