import path from "node:path"
import { fileURLToPath } from "node:url"
import type { NextConfig } from "next"

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..")

const backendApiUrl = (
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001"
).replace(/\/$/, "")

const nextConfig: NextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendApiUrl}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
