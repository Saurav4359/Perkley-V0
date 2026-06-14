"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export function useActiveSection(sectionIds: readonly string[], offset = 80) {
  const [activeSection, setActiveSection] = useState("")
  const lockedUntilRef = useRef(0)

  const setActiveOnNavigate = useCallback((id: string) => {
    if (!sectionIds.includes(id)) return
    setActiveSection(id)
    lockedUntilRef.current = Date.now() + 700
  }, [sectionIds])

  useEffect(() => {
    function updateFromScroll() {
      if (Date.now() < lockedUntilRef.current) return

      const viewportLine = window.scrollY + offset
      let current = sectionIds[0] ?? ""

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i]
        const element = document.getElementById(id)
        if (!element) continue

        const sectionTop = element.getBoundingClientRect().top + window.scrollY
        if (sectionTop <= viewportLine + 1) {
          current = id
          break
        }
      }

      setActiveSection(current)
    }

    function updateFromHash() {
      const hash = window.location.hash.replace("#", "")
      if (hash && sectionIds.includes(hash)) {
        setActiveOnNavigate(hash)
      } else {
        updateFromScroll()
      }
    }

    updateFromHash()
    window.addEventListener("scroll", updateFromScroll, { passive: true })
    window.addEventListener("resize", updateFromScroll)
    window.addEventListener("hashchange", updateFromHash)

    return () => {
      window.removeEventListener("scroll", updateFromScroll)
      window.removeEventListener("resize", updateFromScroll)
      window.removeEventListener("hashchange", updateFromHash)
    }
  }, [sectionIds, offset, setActiveOnNavigate])

  return { activeSection, setActiveOnNavigate }
}
