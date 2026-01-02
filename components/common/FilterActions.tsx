"use client"

import Button from "@/components/ui/button/Button"
import { Search, XCircle } from "lucide-react"

interface FilterActionsProps {
  onSearch: () => void
  onClear: () => void
  isLoading?: boolean
}

export function FilterActions({ onSearch, onClear, isLoading }: FilterActionsProps) {
  return (
    <div className="flex gap-2">
      {/* Search button */}
      <Button
        onClick={onSearch}
        disabled={isLoading}
        startIcon={<Search size={16} />}
      >
        {isLoading ? "Searching..." : "Search"}
      </Button>

      {/* Clear button */}
      <Button
        variant="outline"
        onClick={onClear}
        disabled={isLoading}
        startIcon={<XCircle size={16} />}
      >
        Clear Filters
      </Button>
    </div>
  )
}
