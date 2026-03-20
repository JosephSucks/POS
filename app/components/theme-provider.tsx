"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load theme from settings
    try {
      const savedSettings = localStorage.getItem("pos-settings")
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        if (settings.darkMode) {
          setThemeState("dark")
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }
    } catch (error) {
      console.error("Failed to load theme:", error)
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    
    // Also update in settings
    try {
      const savedSettings = localStorage.getItem("pos-settings")
      const settings = savedSettings ? JSON.parse(savedSettings) : {}
      settings.darkMode = newTheme === "dark"
      localStorage.setItem("pos-settings", JSON.stringify(settings))
    } catch (error) {
      console.error("Failed to save theme:", error)
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  // Always provide context, prevent flash of wrong theme with CSS
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
