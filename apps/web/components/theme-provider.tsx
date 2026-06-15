"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  runThemeTransition,
  type ThemeTransitionOrigin,
} from "@/lib/theme-transition"
import {
  applyTheme,
  getStoredTheme,
  type Theme,
} from "@/lib/theme"

type SetThemeOptions = {
  origin?: ThemeTransitionOrigin
}

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme, options?: SetThemeOptions) => void
  toggleTheme: (options?: SetThemeOptions) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = getStoredTheme()
    const initial = stored ?? "light"
    setThemeState(initial)
    applyTheme(initial)
    setMounted(true)
  }, [])

  const setTheme = useCallback((next: Theme, options?: SetThemeOptions) => {
    runThemeTransition(next, options?.origin)
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(
    (options?: SetThemeOptions) => {
      setTheme(theme === "dark" ? "light" : "dark", options)
    },
    [setTheme, theme]
  )

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, mounted }),
    [theme, setTheme, toggleTheme, mounted]
  )

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
