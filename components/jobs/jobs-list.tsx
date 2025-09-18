"use client"

import { JobsListDraggable } from "./jobs-list-draggable"
import { Pagination } from "@/components/ui/pagination"
import type { Job } from "@/lib/types"

interface JobsListProps {
  jobs: Job[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  currentPage: number
  onPageChange: (page: number) => void
  onJobUpdated: () => void
}

export function JobsList({ jobs, loading, error, pagination, currentPage, onPageChange, onJobUpdated }: JobsListProps) {
  return (
    <div className="space-y-6">
      <JobsListDraggable jobs={jobs} loading={loading} error={error} onJobUpdated={onJobUpdated} />

      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={currentPage} totalPages={pagination.totalPages} onPageChange={onPageChange} />
        </div>
      )}
    </div>
  )
}
