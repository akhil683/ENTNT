"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { AssessmentsList } from "@/components/assessments/assessments-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { mockApi } from "@/lib/mock-api"
import type { Assessment } from "@/lib/types"
import { useRouter } from "next/navigation"

export default function AssessmentsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const jobFilter = searchParams.get("job")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { jobs, assessments, setAssessments, setAssessmentsLoading, setAssessmentsError } = useAppStore()

  const loadAssessments = async () => {
    try {
      setLoading(true)
      setAssessmentsLoading(true)
      setError(null)
      setAssessmentsError(null)

      // Load assessments for all jobs
      const assessmentPromises = jobs.map(async (job) => {
        try {
          const assessment = await mockApi.getAssessment(job.id)
          return assessment
        } catch {
          return null
        }
      })

      const assessmentResults = await Promise.all(assessmentPromises)
      const validAssessments = assessmentResults.filter((assessment): assessment is Assessment => assessment !== null)

      setAssessments(validAssessments)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load assessments"
      setError(errorMessage)
      setAssessmentsError(errorMessage)
    } finally {
      setLoading(false)
      setAssessmentsLoading(false)
    }
  }

  useEffect(() => {
    loadAssessments()
  }, [jobs])

  const filteredAssessments = jobFilter
    ? assessments.filter((assessment) => assessment.jobId === jobFilter)
    : assessments

  const handleCreateAssessment = () => {
    if (jobFilter) {
      router.push(`/assessments/builder?job=${jobFilter}`)
    } else {
      router.push("/assessments/builder")
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Assessments</h1>
              <p className="text-muted-foreground">Create and manage job-specific assessments for candidates</p>
            </div>
            <Button onClick={handleCreateAssessment} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Assessment
            </Button>
          </div>

          <AssessmentsList
            assessments={filteredAssessments}
            jobs={jobs}
            loading={loading}
            error={error}
            onAssessmentUpdated={loadAssessments}
          />
        </div>
      </main>
    </div>
  )
}
