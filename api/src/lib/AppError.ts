export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string = 'APP_ERROR',
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
