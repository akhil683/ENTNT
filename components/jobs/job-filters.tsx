"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, X, ChevronDown } from "lucide-react"

interface JobFiltersProps {
  filters: {
    search: string
    status: string
    sort: string
  }
  onFiltersChange: (filters: { search: string; status: string; sort: string }) => void
  loading?: boolean
}

export function JobFilters({ filters, onFiltersChange, loading }: JobFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value === "all" ? "" : value })
  }

  const handleSortChange = (value: string) => {
    onFiltersChange({ ...filters, sort: value })
  }

  const clearFilters = () => {
    onFiltersChange({ search: "", status: "", sort: "createdAt:desc" })
  }

  const hasActiveFilters = filters.search || filters.status

  const getStatusLabel = () => {
    if (!filters.status) return "All Status"
    return filters.status === "active" ? "Active" : "Archived"
  }

  const getSortLabel = () => {
    switch (filters.sort) {
      case "createdAt:desc":
        return "Newest First"
      case "createdAt:asc":
        return "Oldest First"
      case "title:asc":
        return "Title A-Z"
      case "title:desc":
        return "Title Z-A"
      case "order:asc":
        return "Order"
      default:
        return "Newest First"
    }
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title or tags..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 bg-input"
              disabled={loading}
            />
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[150px] justify-between bg-input" disabled={loading}>
              {getStatusLabel()}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStatusChange("all")}>All Status</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("active")}>Active</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange("archived")}>Archived</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[180px] justify-between bg-input" disabled={loading}>
              {getSortLabel()}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleSortChange("createdAt:desc")}>Newest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("createdAt:asc")}>Oldest First</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("title:asc")}>Title A-Z</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("title:desc")}>Title Z-A</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSortChange("order:asc")}>Order</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} disabled={loading} className="bg-transparent">
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
