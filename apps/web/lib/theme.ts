export type Theme = "light" | "dark"

export const THEME_STORAGE_KEY = "perkley-theme"

export function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark"
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark")
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : null
  } catch {
    return null
  }
}

export function storeTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // ignore storage failures
  }
}
