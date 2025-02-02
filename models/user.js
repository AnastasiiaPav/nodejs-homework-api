const { Schema, model } = require("mongoose");
const Joi = require("joi");
// const emailRegex = /^[a-zA0-9]+@[a-z]+\.[a-z]{2,3}$/;

const userSchema = new Schema(
  {
    password: {
      type: String,
      min: 6,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      // match: [emailRegex, "Please enter a valid email"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ["starter", "pro", "business"],
      default: "starter",
    },
    avatarURL: String,
    token: String,
    verify: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: [true, "Verify token is required"],
    },
  },
  { versionKey: false, timestamps: true }
);

const subscriptionShema = Joi.object({
  subscription: Joi.string().valid("starter", "pro", "business").required(),
});

const registerSchema = Joi.object({
  email: Joi.string()
    // .pattern(emailRegex)
    .required()
    .messages({ "any.required": "Email is invalid" }),
  password: Joi.string().min(6).required(),
  subscription: Joi.string(),
});

const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

const emailSchema = Joi.object({
  email: Joi.string().required(),
});

const User = model("user", userSchema);

module.exports = {
  User,
  registerSchema,
  loginSchema,
  subscriptionShema,
  emailSchema,
};
