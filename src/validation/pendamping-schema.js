const Joi = require("joi");

const pendampingSchema = {
  create: Joi.object({
    niup: Joi.array().required(),
  }),
};

module.exports = pendampingSchema;
