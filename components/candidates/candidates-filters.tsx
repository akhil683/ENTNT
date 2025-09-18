"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, X, Users, ChevronDown } from "lucide-react"
import type { Job } from "@/lib/types"

interface CandidatesFiltersProps {
  filters: {
    search: string
    stage: string
    jobId: string
  }
  onFiltersChange: (filters: { search: string; stage: string; jobId: string }) => void
  loading?: boolean
  jobs: Job[]
  totalCount: number
}

const stages = [
  { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-800" },
  { value: "screen", label: "Screening", color: "bg-yellow-100 text-yellow-800" },
  { value: "tech", label: "Technical", color: "bg-purple-100 text-purple-800" },
  { value: "offer", label: "Offer", color: "bg-orange-100 text-orange-800" },
  { value: "hired", label: "Hired", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
]

export function CandidatesFilters({ filters, onFiltersChange, loading, jobs, totalCount }: CandidatesFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleStageChange = (value: string) => {
    onFiltersChange({ ...filters, stage: value === "all" ? "" : value })
  }

  const handleJobChange = (value: string) => {
    onFiltersChange({ ...filters, jobId: value === "all" ? "" : value })
  }

  const clearFilters = () => {
    onFiltersChange({ search: "", stage: "", jobId: "" })
  }

  const hasActiveFilters = filters.search || filters.stage || filters.jobId
  const selectedJob = jobs.find((job) => job.id === filters.jobId)

  const getStageLabel = () => {
    if (!filters.stage) return "All Stages"
    const stage = stages.find((s) => s.value === filters.stage)
    return stage ? stage.label : "All Stages"
  }

  const getJobLabel = () => {
    if (!filters.jobId) return "All Jobs"
    return selectedJob ? selectedJob.title : "All Jobs"
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="font-medium text-card-foreground">
            {totalCount.toLocaleString()} candidate{totalCount !== 1 ? "s" : ""}
          </span>
          {hasActiveFilters && <Badge variant="secondary">Filtered</Badge>}
        </div>

        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearFilters} disabled={loading} className="bg-transparent">
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
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
              {getStageLabel()}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleStageChange("all")}>All Stages</DropdownMenuItem>
            {stages.map((stage) => (
              <DropdownMenuItem key={stage.value} onClick={() => handleStageChange(stage.value)}>
                {stage.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-between bg-input" disabled={loading}>
              {getJobLabel()}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleJobChange("all")}>All Jobs</DropdownMenuItem>
            {jobs
              .filter((job) => job.status === "active")
              .map((job) => (
                <DropdownMenuItem key={job.id} onClick={() => handleJobChange(job.id)}>
                  {job.title}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedJob && (
        <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-primary">
            Showing candidates for: <span className="font-medium">{selectedJob.title}</span>
          </p>
        </div>
      )}
    </div>
  )
}
