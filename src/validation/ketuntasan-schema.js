const Joi = require("joi");

const ketuntasanSchema = {
  addUp: Joi.object({
    nama: Joi.string().required(),
    alias: Joi.string().required(),
    statusTrue: Joi.string().required(),
    statusFalse: Joi.string().required(),
    penjab: Joi.string().required(),
    isAktif: Joi.required(),
  }),
};

module.exports = ketuntasanSchema;
