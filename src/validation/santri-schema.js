const Joi = require("joi");

const santriSchema = {
  daftarRombongan: Joi.object({
    statusKepulangan: Joi.required(),
    statusRombongan: Joi.required(),
    dropspotId: Joi.optional(),
  }),
};

module.exports = santriSchema;
