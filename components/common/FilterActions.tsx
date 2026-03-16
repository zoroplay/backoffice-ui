"use client"

import Button from "@/components/ui/button/Button"
import { Search, XCircle } from "lucide-react"

interface FilterActionsProps {
  onSearch: () => void | Promise<void>
  onClear: () => void | Promise<void>
  isLoading?: boolean
}

export function FilterActions({ onSearch, onClear, isLoading }: FilterActionsProps) {
  return (
    <div className="flex gap-2">
      {/* Search button */}
      <Button
        type="button"
        onClick={() => {
          void onSearch();
        }}
        disabled={isLoading}
        startIcon={<Search size={16} />}
      >
        {isLoading ? "Searching..." : "Search"}
      </Button>

      {/* Clear button */}
      <Button
        variant="outline"
        type="button"
        onClick={() => {
          void onClear();
        }}
        disabled={isLoading}
        startIcon={<XCircle size={16} />}
      >
        Clear Filters
      </Button>
    </div>
  )
}
