const Joi = require("joi");

const areaSchema = {
  addUp: Joi.object({
    namaArea: Joi.string().required(),
    picInt: Joi.optional(),
    hpPicInt: Joi.optional(),
    picExt: Joi.optional(),
    hpPicExt: Joi.optional(),
  }),
};

module.exports = areaSchema;
