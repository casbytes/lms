import { StatusCodes } from "http-status-codes";

/**
 * Custom error class to be extended by other error classes
 */
abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }
}

/**
 * Error thrown when a user is not authorized to access a resource
 */
export class UnAuthorizedError extends CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;

  constructor(public message = "Unauthorized!") {
    super(message);
    Object.setPrototypeOf(this, UnAuthorizedError.prototype);
  }
}

/**
 * Error thrown when a request is made with invalid parameters
 */
export class BadRequestError extends CustomError {
  statusCode = StatusCodes.BAD_REQUEST;

  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

/**
 * Error thrown when a user is not authorized to access a resource
 */
export class NotFoundError extends CustomError {
  statusCode = StatusCodes.NOT_FOUND;

  constructor(public message = "Not Found!") {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Error thrown when an error occurs on the server
 */
export class InternalServerError extends CustomError {
  statusCode = StatusCodes.INTERNAL_SERVER_ERROR;

  constructor(public message = "Internal Server Error!") {
    super(message);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
