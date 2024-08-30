const Joi = require("joi");

const persyaratanSchema = {
  tuntas: Joi.object({
    data: Joi.array().required(),
  }),
};

module.exports = persyaratanSchema;
