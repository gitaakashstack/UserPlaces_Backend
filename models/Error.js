export class httpError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    this.name = "http_error";
  }
}

export class validationError extends httpError {
  constructor(statusCode, error) {
    super("Form Validation Error", statusCode);
    this.name = "validation_error";
    this.formValidationErrors = error;
  }
}

export class customError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "custom_error";
  }
}
