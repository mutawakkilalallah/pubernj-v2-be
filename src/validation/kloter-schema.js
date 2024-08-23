const Joi = require("joi");

const kloterSchema = {
  AddUp: Joi.object({
    namaKloter: Joi.string().required(),
    namaArmada: Joi.string().required(),
    type: Joi.required(),
    jenis: Joi.required(),
    hargaSewa: Joi.optional(),
    dropspotId: Joi.required(),
    jadwalKeberangkatan: Joi.optional(),
  }),
};

module.exports = kloterSchema;
