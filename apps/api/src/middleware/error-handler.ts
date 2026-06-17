import { Prisma } from "@prisma/client"
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

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Log the full Prisma error server-side only; never leak internal details.
    console.error(err)

    if (err.code === "P2002") {
      res.status(409).json({
        error: "This record already exists.",
        code: "conflict",
      })
      return
    }

    if (err.code === "P2025") {
      res.status(404).json({
        error: "Resource not found.",
        code: "not_found",
      })
      return
    }

    res.status(400).json({
      error: "The request could not be processed.",
      code: "bad_request",
    })
    return
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    console.error(err)
    res.status(400).json({
      error: "The request could not be processed.",
      code: "bad_request",
    })
    return
  }

  console.error(err)
  res.status(500).json({
    error: "Internal server error",
    code: "internal_server_error",
  })
}
