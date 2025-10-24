export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class UserExistError extends AppError {
  constructor(message: string) {
    super(message, 400, 'User Already exist');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: string = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class InsufficientFundsError extends AppError {
  constructor(message = 'Insufficient funds in wallet') {
    super(message, 400, 'INSUFFICIENT_FUNDS');
  }
}

export class BlacklistedUserError extends AppError {
  constructor(message = 'User is blacklisted and cannot be onboarded') {
    super(message, 403, 'BLACKLISTED_USER');
  }
}

export class DuplicateReferenceError extends AppError {
  constructor(message = 'Transaction with this reference already exists') {
    super(message, 409, 'DUPLICATE_REFERENCE');
  }
}