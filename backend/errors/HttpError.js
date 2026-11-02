export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }

  static badRequest(msg) { return new HttpError(400, msg); }
  static unauthorized(msg) { return new HttpError(401, msg); }
  static forbidden(msg) { return new HttpError(403, msg); }
  static notFound(msg) { return new HttpError(404, msg); }
}
