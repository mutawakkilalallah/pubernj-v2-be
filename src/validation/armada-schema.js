const Joi = require("joi");

const armadaSchema = {
  add: Joi.object({
    type: Joi.required(),
    jenis: Joi.required(),
    hargaSewa: Joi.optional(),
    dropspotId: Joi.required(),
    jadwalKeberangkatan: Joi.required(),
  }),
  up: Joi.object({
    namaArmada: Joi.string().required(),
    type: Joi.required(),
    jenis: Joi.required(),
    hargaSewa: Joi.optional(),
    dropspotId: Joi.required(),
    jadwalKeberangkatan: Joi.required(),
  }),
};

module.exports = armadaSchema;
