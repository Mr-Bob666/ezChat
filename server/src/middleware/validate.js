import Joi from 'joi';
import { ValidationError } from '../utils/errors.js';

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return next(new ValidationError(message));
    }
    req.body = value;
    next();
  };
}

// Reusable schemas
export const schemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(50).required(),
    code: Joi.string().length(6).pattern(/^\d+$/).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  sendCode: Joi.object({
    email: Joi.string().email().required(),
    type: Joi.string().valid('register', 'reset').required(),
  }),
  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().length(6).pattern(/^\d+$/).required(),
    newPassword: Joi.string().min(6).max(50).required(),
  }),
  createRoom: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).allow('', null),
    is_private: Joi.boolean().default(false),
  }),
  joinByCode: Joi.object({
    invite_code: Joi.string().length(8).alphanum().required(),
  }),
  sendMessage: Joi.object({
    roomId: Joi.number().integer().positive().required(),
    content: Joi.string().min(1).max(2000).required(),
  }),
};
