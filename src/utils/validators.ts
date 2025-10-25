import Joi from 'joi';

export const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  first_name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'First name must be at least 2 characters',
    'string.max': 'First name cannot exceed 100 characters',
    'any.required': 'First name is required',
  }),
  last_name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Last name must be at least 2 characters',
    'string.max': 'Last name cannot exceed 100 characters',
    'any.required': 'Last name is required',
  }),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
      'any.required': 'Phone number is required',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
});

export const fundWalletSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required',
  }),
  reference: Joi.string().min(5).max(100).required().messages({
    'string.min': 'Reference must be at least 5 characters',
    'string.max': 'Reference cannot exceed 100 characters',
    'any.required': 'Reference is required',
  }),
});

export const transferFundsSchema = Joi.object({
  account_no: Joi.string().required().messages({
    'string.account_no': 'Please provide a valid recipient account number',
    'any.required': 'Recipient account number is required',
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required',
  }),
  description: Joi.string().max(500).optional().messages({
    'string.max': 'Description cannot exceed 500 characters',
  }),
});

export const withdrawFundsSchema = Joi.object({
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Amount must be greater than 0',
    'any.required': 'Amount is required',
  }),
  bankAccount: Joi.string().min(10).max(10).required().messages({
    'string.min': 'Bank account must be 10 digits',
    'string.max': 'Bank account must be 10 digits',
    'any.required': 'Bank account is required',
  }),
  bankCode: Joi.string().length(3).required().messages({
    'string.length': 'Bank code must be 3 digits',
    'any.required': 'Bank code is required',
  }),
});