const Joi = require("joi");

const userSchema = {
  create: Joi.object({
    niup: Joi.required(),
    username: Joi.string().min(4).required(),
    password: Joi.string().min(4).required(),
    passwordConfirmation: Joi.string().min(4).required(),
    hp: Joi.string().required(),
    role: Joi.required(),
  }),
  update: Joi.object({
    username: Joi.string().min(4).required(),
    hp: Joi.string().required(),
    role: Joi.required(),
  }),
  updatePassword: Joi.object({
    password: Joi.string().min(4).required(),
    passwordConfirmation: Joi.string().min(4).required(),
  }),
};

module.exports = userSchema;
