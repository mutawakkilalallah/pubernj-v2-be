const validate = (schema, request, response) => {
  const result = schema.validate(request, {
    abortEarly: false,
    allowUnknown: false,
  });
  if (result.error) {
    return response.status(400).json({
      status: 400,
      message: "BAD REQUEST",
      error: result.error.details.map((err) => err.message),
    });
  } else {
    return result.value;
  }
};

module.exports = validate;
