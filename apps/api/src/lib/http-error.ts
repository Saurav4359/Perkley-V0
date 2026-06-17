export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code = "request_failed"
  ) {
    super(message)
  }
}

export function badRequest(message: string, code = "bad_request") {
  return new HttpError(400, message, code)
}

export function unauthorized(message = "Authentication required") {
  return new HttpError(401, message, "unauthorized")
}

export function forbidden(message = "Forbidden") {
  return new HttpError(403, message, "forbidden")
}

export function conflict(message: string, code = "conflict") {
  return new HttpError(409, message, code)
}

export function notFound(message = "Not found", code = "not_found") {
  return new HttpError(404, message, code)
}
