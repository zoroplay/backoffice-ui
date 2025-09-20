"use client"

import  Button  from "@/components/ui/button/Button"

interface FilterActionsProps {
  onSearch: () => void
  onClear: () => void
  isLoading?: boolean
}

export function FilterActions({ onSearch, onClear, isLoading }: FilterActionsProps) {
  return (
    <div className="flex gap-2 ">
      <Button onClick={onSearch} disabled={isLoading}>
        {isLoading ? "Searching..." : "Search"}
      </Button>
      <Button variant="outline" onClick={onClear} disabled={isLoading}>
        Clear Filters
      </Button>
    </div>
  )
}
