const Joi = require("joi");

const persyaratanSchema = {
  tuntas: Joi.object({
    data: Joi.array().required(),
  }),
  tuntasMobile: Joi.object({
    type: Joi.string().required(),
    status: Joi.boolean().required(),
  }),
};

module.exports = persyaratanSchema;
