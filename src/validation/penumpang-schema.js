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
};

module.exports = areaSchema;
