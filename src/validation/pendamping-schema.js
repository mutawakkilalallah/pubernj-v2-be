const Joi = require("joi");

const pendampingSchema = {
  create: Joi.object({
    niup: Joi.array().required(),
  }),
  edit: Joi.object({
    hp: Joi.string().required(),
  }),
};

module.exports = pendampingSchema;
