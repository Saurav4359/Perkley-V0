import { applyTheme, storeTheme, type Theme } from "@/lib/theme"

export type ThemeTransitionOrigin = {
  x: number
  y: number
}

export const THEME_TRANSITION_MS = 350

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

function setPageTurnVars(origin: ThemeTransitionOrigin) {
  const fromRight = origin.x >= window.innerWidth / 2
  const root = document.documentElement

  root.style.setProperty("--theme-transition-duration", `${THEME_TRANSITION_MS}ms`)
  root.style.setProperty("--theme-turn-origin-x", fromRight ? "100%" : "0%")
  root.style.setProperty(
    "--theme-turn-origin-y",
    `${(origin.y / window.innerHeight) * 100}%`
  )
  root.style.setProperty("--theme-turn-rotate", fromRight ? "-180deg" : "180deg")
}

function clearPageTurnVars() {
  const root = document.documentElement

  root.classList.remove("theme-page-turn-active")
  root.style.removeProperty("--theme-transition-duration")
  root.style.removeProperty("--theme-turn-origin-x")
  root.style.removeProperty("--theme-turn-origin-y")
  root.style.removeProperty("--theme-turn-rotate")
}

function getCurrentThemeBackground() {
  const { backgroundColor } = getComputedStyle(document.body)
  if (backgroundColor && backgroundColor !== "rgba(0, 0, 0, 0)") {
    return backgroundColor
  }

  return document.documentElement.classList.contains("dark") ? "#0a0a0a" : "#fafaf9"
}

function runInstantPageTurn(theme: Theme, origin: ThemeTransitionOrigin) {
  setPageTurnVars(origin)
  document.documentElement.classList.add("theme-page-turn-active")

  const sheet = document.createElement("div")
  sheet.className = "theme-page-turn-sheet theme-page-turn-sheet-animate"
  sheet.setAttribute("aria-hidden", "true")
  sheet.style.background = getCurrentThemeBackground()
  document.body.appendChild(sheet)

  applyTheme(theme)
  storeTheme(theme)

  const cleanup = () => {
    sheet.remove()
    clearPageTurnVars()
  }

  sheet.addEventListener("animationend", cleanup, { once: true })
  window.setTimeout(cleanup, THEME_TRANSITION_MS + 50)
}

export function runThemeTransition(
  theme: Theme,
  origin?: ThemeTransitionOrigin
) {
  if (typeof document === "undefined") {
    applyTheme(theme)
    storeTheme(theme)
    return
  }

  if (prefersReducedMotion()) {
    applyTheme(theme)
    storeTheme(theme)
    return
  }

  const turnOrigin = origin ?? {
    x: window.innerWidth * 0.85,
    y: window.innerHeight * 0.08,
  }

  runInstantPageTurn(theme, turnOrigin)
}
