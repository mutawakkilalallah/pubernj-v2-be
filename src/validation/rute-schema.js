const Joi = require("joi");

const ruteSchema = {
  addUp: Joi.object({
    namaRute: Joi.string().required(),
    kategori: Joi.required(),
  }),
};

module.exports = ruteSchema;
