const Joi = require("joi");

const authSchema = {
  login: Joi.object({
    username: Joi.required(),
    password: Joi.required(),
  }),
  refreshToken: Joi.object({
    token: Joi.required(),
  }),
};

module.exports = authSchema;
