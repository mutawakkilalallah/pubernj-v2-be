const Joi = require("joi");

const authSchema = {
  login: Joi.object({
    username: Joi.required(),
    password: Joi.required(),
  }),
};

module.exports = authSchema;
