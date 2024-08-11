const Joi = require("joi");

const dropspotSchema = {
  addUp: Joi.object({
    namaDropspot: Joi.string().required(),
    cakupan: Joi.optional(),
    harga: Joi.required(),
    grup: Joi.required(),
    areaId: Joi.required(),
  }),
};

module.exports = dropspotSchema;
