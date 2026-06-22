export function scrollToSection(id: string, onScroll?: (id: string) => void) {
  const element = document.getElementById(id)
  if (!element) return false

  element.scrollIntoView({ behavior: "smooth", block: "start" })
  onScroll?.(id)

  const hash = `#${id}`
  if (window.location.hash !== hash) {
    window.history.pushState(null, "", hash)
  }

  return true
}
