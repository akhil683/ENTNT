"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { AssessmentBuilder } from "@/components/assessments/assessment-builder"
import { AssessmentPreview } from "@/components/assessments/assessment-preview"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, Save, Eye, EyeOff, ChevronDown } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { mockApi } from "@/lib/mock-api"
import type { Assessment } from "@/lib/types"

export default function AssessmentBuilderPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const jobFilter = searchParams.get("job")

  const [selectedJobId, setSelectedJobId] = useState(jobFilter || "")
  const [showPreview, setShowPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [assessment, setAssessment] = useState<Assessment | null>(null)

  const { jobs } = useAppStore()

  // Initialize new assessment
  useEffect(() => {
    if (selectedJobId && !assessment) {
      const job = jobs.find((j) => j.id === selectedJobId)
      if (job) {
        const newAssessment: Assessment = {
          id: `assessment-${Date.now()}`,
          jobId: selectedJobId,
          title: `${job.title} Assessment`,
          description: `Assessment for ${job.title} position`,
          sections: [
            {
              id: `section-${Date.now()}`,
              title: "General Questions",
              description: "Basic questions for all candidates",
              questions: [],
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        setAssessment(newAssessment)
      }
    }
  }, [selectedJobId, jobs, assessment])

  const handleSave = async () => {
    if (!assessment) return

    try {
      setSaving(true)
      await mockApi.saveAssessment(assessment)
      router.push("/assessments")
    } catch (error) {
      console.error("Failed to save assessment:", error)
    } finally {
      setSaving(false)
    }
  }

  const activeJobs = jobs.filter((job) => job.status === "active")

  const getJobLabel = () => {
    if (!selectedJobId) return "Choose a job to create assessment for..."
    const job = jobs.find((j) => j.id === selectedJobId)
    return job ? job.title : "Choose a job to create assessment for..."
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/assessments")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Assessments
              </Button>

              <div className="h-6 w-px bg-border" />

              <div>
                <h1 className="text-3xl font-bold text-foreground">Assessment Builder</h1>
                <p className="text-muted-foreground">Create and customize assessments for your job positions</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="bg-transparent"
                disabled={!assessment}
              >
                {showPreview ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show Preview
                  </>
                )}
              </Button>

              <Button onClick={handleSave} disabled={saving || !assessment} className="bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Assessment"}
              </Button>
            </div>
          </div>

          {!selectedJobId && (
            <div className="mb-8">
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Select a Job Position</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full max-w-md justify-between bg-input">
                      {getJobLabel()}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {activeJobs.map((job) => (
                      <DropdownMenuItem key={job.id} onClick={() => setSelectedJobId(job.id)}>
                        {job.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          {assessment && (
            <div className={`grid ${showPreview ? "grid-cols-2" : "grid-cols-1"} gap-8`}>
              <div>
                <AssessmentBuilder assessment={assessment} onAssessmentChange={setAssessment} />
              </div>

              {showPreview && (
                <div className="border-l border-border pl-8">
                  <div className="sticky top-8">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Live Preview</h3>
                    <AssessmentPreview assessment={assessment} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
