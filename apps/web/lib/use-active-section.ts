"use client"

import { useEffect, useState } from "react"

export function useActiveSection(sectionIds: readonly string[], offset = 80) {
  const [activeSection, setActiveSection] = useState("")

  useEffect(() => {
    function updateActiveSection() {
      let current = ""

      for (const id of sectionIds) {
        const element = document.getElementById(id)
        if (!element) continue

        if (element.getBoundingClientRect().top <= offset) {
          current = id
        }
      }

      setActiveSection(current)
    }

    updateActiveSection()
    window.addEventListener("scroll", updateActiveSection, { passive: true })
    window.addEventListener("resize", updateActiveSection)

    return () => {
      window.removeEventListener("scroll", updateActiveSection)
      window.removeEventListener("resize", updateActiveSection)
    }
  }, [sectionIds, offset])

  return activeSection
}
