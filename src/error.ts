type FetchErrorOptions = {
  statusCode: number;
  message: string;
}

class FetchError extends Error {
  statusCode: number;
  constructor({statusCode, message}: FetchErrorOptions) {
    super(message);
    this.statusCode = statusCode;
  }

  get status(): number {
    return this.statusCode;
  }
}

export default FetchError;
