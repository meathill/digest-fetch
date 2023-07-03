type FetchErrorOptions = {
  statusCode: number;
  message: string;
  response: Response;
}

class FetchError extends Error {
  statusCode: number;
  response: Response;
  constructor({statusCode, message, response}: FetchErrorOptions) {
    super(message);
    this.statusCode = statusCode;
    this.response = response;
  }

  get status(): number {
    return this.statusCode;
  }
}

export default FetchError;
