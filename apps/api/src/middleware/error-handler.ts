import type { ErrorRequestHandler } from "express"
import { ZodError } from "zod"

import { HttpError } from "../lib/http-error"

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      code: "validation_failed",
      issues: err.issues,
    })
    return
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.message,
      code: err.code,
    })
    return
  }

  console.error(err)
  res.status(500).json({
    error: "Internal server error",
    code: "internal_server_error",
  })
}
