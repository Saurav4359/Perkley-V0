"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useId, useRef, useState } from "react"
import { Search } from "lucide-react"

import { useDashboardSearch, type DashboardSearchResult } from "@/hooks/use-dashboard-search"
import { cn } from "@/lib/utils"

type DashboardSearchProps = {
  mode: "brand" | "creator"
  className?: string
  onNavigate?: () => void
}

function ResultItem({
  result,
  active,
  onSelect,
}: {
  result: DashboardSearchResult
  active: boolean
  onSelect: () => void
}) {
  return (
    <Link
      href={result.href}
      onClick={onSelect}
      className={cn(
        "block px-3 py-2.5 transition-colors",
        active ? "bg-muted" : "hover:bg-muted/70"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{result.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {result.brand} · {result.type} · {result.niche}
          </p>
        </div>
        {result.isOwnListing ? (
          <span className="shrink-0 rounded-full bg-brand-muted px-2 py-0.5 text-[10px] font-medium text-brand">
            Yours
          </span>
        ) : null}
      </div>
    </Link>
  )
}

export function DashboardSearch({ mode, className, onNavigate }: DashboardSearchProps) {
  const router = useRouter()
  const inputId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const { results, isLoading } = useDashboardSearch(query, mode)

  const showResults = open && query.trim().length > 0

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  function closeSearch() {
    setOpen(false)
    setQuery("")
    setActiveIndex(0)
    onNavigate?.()
  }

  function goToResult(result: DashboardSearchResult) {
    closeSearch()
    router.push(result.href)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showResults) {
      if (event.key === "Escape") {
        closeSearch()
        inputRef.current?.blur()
      }
      return
    }

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, results.length - 1))
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
      return
    }

    if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault()
      goToResult(results[activeIndex])
      return
    }

    if (event.key === "Escape") {
      event.preventDefault()
      closeSearch()
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <label htmlFor={inputId} className="relative block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={mode === "brand" ? "Search listings, brands..." : "Search campaigns, brands..."}
          autoComplete="off"
          role="combobox"
          aria-expanded={showResults}
          aria-controls={`${inputId}-results`}
          aria-autocomplete="list"
          className="h-10 w-full rounded-full border border-border bg-muted/40 pl-10 pr-14 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
          ⌘K
        </kbd>
      </label>

      {showResults ? (
        <div
          id={`${inputId}-results`}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[60] overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
          onMouseDown={(event) => event.preventDefault()}
        >
          {results.length > 0 ? (
            <div className="max-h-80 overflow-y-auto py-1">
              {results.map((result, index) => (
                <ResultItem
                  key={result.id}
                  result={result}
                  active={index === activeIndex}
                  onSelect={closeSearch}
                />
              ))}
            </div>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              {isLoading
                ? "Searching…"
                : `No listings match "${query.trim()}"`}
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}

export function DashboardSearchMobileTrigger({
  mode,
  onOpenChange,
}: {
  mode: "brand" | "creator"
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)

  function setMobileSearchOpen(next: boolean) {
    setOpen(next)
    onOpenChange?.(next)
  }

  return (
    <button
      type="button"
      aria-label={open ? "Close search" : "Open search"}
      aria-expanded={open}
      onClick={() => setMobileSearchOpen(!open)}
      className="inline-flex min-h-touch min-w-[2.75rem] items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
    >
      <Search className="size-4" />
    </button>
  )
}

export function DashboardSearchMobilePanel({
  mode,
  open,
  onClose,
}: {
  mode: "brand" | "creator"
  open: boolean
  onClose: () => void
}) {
  if (!open) return null

  return (
    <div className="absolute inset-x-0 top-full z-50 border-b border-border bg-background px-4 py-3 shadow-sm md:hidden">
      <DashboardSearch
        mode={mode}
        className="w-full"
        onNavigate={onClose}
      />
    </div>
  )
}
