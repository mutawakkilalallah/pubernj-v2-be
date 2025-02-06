const Joi = require("joi");

const areaSchema = {
  statusKepulangan: Joi.object({
    statusKepulangan: Joi.required(),
  }),
  statusRombongan: Joi.object({
    statusRombongan: Joi.required(),
  }),
  addDrop: Joi.object({
    dropspotId: Joi.required(),
  }),
  addArmada: Joi.object({
    penumpang: Joi.array().required(),
  }),
};

module.exports = areaSchema;
