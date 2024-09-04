const Joi = require("joi");

const transportSchema = {
  addUp: Joi.object({
    namaTransportasi: Joi.string().required(),
    kategori: Joi.required(),
  }),
};

module.exports = transportSchema;
