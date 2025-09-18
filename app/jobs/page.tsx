"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { JobsList } from "@/components/jobs/jobs-list"
import { JobFilters } from "@/components/jobs/job-filters"
import { CreateJobModal } from "@/components/jobs/create-job-modal"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { mockApi } from "@/lib/mock-api"
import type { Job } from "@/lib/types"

export default function JobsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    sort: "createdAt:desc",
  })

  const { jobs, jobsLoading, jobsError, setJobs, setJobsLoading, setJobsError } = useAppStore()

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  })

  const loadJobs = async () => {
    try {
      setJobsLoading(true)
      setJobsError(null)

      const response = await mockApi.getJobs({
        ...filters,
        page: currentPage,
        pageSize: 10,
      })

      setJobs(response.data)
      setPagination(response.pagination)
    } catch (error) {
      setJobsError(error instanceof Error ? error.message : "Failed to load jobs")
    } finally {
      setJobsLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [currentPage, filters])

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleJobCreated = (job: Job) => {
    loadJobs() // Refresh the list
    setIsCreateModalOpen(false)
  }

  const handleJobUpdated = () => {
    loadJobs() // Refresh the list
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Jobs</h1>
              <p className="text-muted-foreground">Manage your job postings and track their performance</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Job
            </Button>
          </div>

          <div className="space-y-6">
            <JobFilters filters={filters} onFiltersChange={handleFilterChange} loading={jobsLoading} />

            <JobsList
              jobs={jobs}
              loading={jobsLoading}
              error={jobsError}
              pagination={pagination}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onJobUpdated={handleJobUpdated}
            />
          </div>

          <CreateJobModal
            open={isCreateModalOpen}
            onOpenChange={setIsCreateModalOpen}
            onJobCreated={handleJobCreated}
          />
        </div>
      </main>
    </div>
  )
}
