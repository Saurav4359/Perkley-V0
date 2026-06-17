import type { NextFunction, Request, Response } from "express"

export function requestLog(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()

  res.on("finish", () => {
    const durationMs = Date.now() - start
    const level = res.statusCode >= 500 ? "error" : "info"

    console[level]("request completed", {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs,
    })
  })

  next()
}
