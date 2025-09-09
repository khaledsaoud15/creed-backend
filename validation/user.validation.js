const Joi = require("joi");

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userValidationSchema = Joi.object({
  username: Joi.string().when("googleId", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  email: Joi.string().pattern(emailPattern).required().messages({
    "string.pattern.base": "Email must be a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string()
    .pattern(passwordPattern)
    .when("googleId", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    })
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      "any.required": "Password is required",
    }),
  googleId: Joi.string().optional(),
  role: Joi.string().valid("user", "admin").default("user"),
});

module.exports = userValidationSchema;
