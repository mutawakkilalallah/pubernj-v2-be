const Joi = require("joi");

const dropspotSchema = {
  addUp: Joi.object({
    namaDropspot: Joi.string().required(),
    cakupan: Joi.optional(),
    tglBerangkatPutra: Joi.optional(),
    tglBerangkatPutri: Joi.optional(),
    jamBerangkatPutra: Joi.optional(),
    jamBerangkatPutri: Joi.optional(),
    areaId: Joi.required(),
  }),
};

module.exports = dropspotSchema;
