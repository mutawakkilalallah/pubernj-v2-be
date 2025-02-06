const Joi = require("joi");

const authSchema = {
  loginWs: Joi.object({
    username: Joi.required(),
    password: Joi.string().length(8).required(),
  }),
  login: Joi.object({
    username: Joi.required(),
    password: Joi.required(),
  }),
  refreshToken: Joi.object({
    token: Joi.required(),
  }),
};

module.exports = authSchema;
