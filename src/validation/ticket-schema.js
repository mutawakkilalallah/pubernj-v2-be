const Joi = require("joi");

const ticketSchema = {
  addUp: Joi.object({
    jadwalTiket: Joi.required(),
    hargaTiket: Joi.number().required(),
    pembayaranTiket: Joi.optional(),
    penumpangId: Joi.required(),
    kloterId: Joi.required(),
    transportasiId: Joi.required(),
    ruteAwalId: Joi.required(),
    ruteAkhirId: Joi.required(),
  }),
};

module.exports = ticketSchema;
