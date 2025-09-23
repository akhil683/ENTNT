"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal, Edit, Eye, FileText, Calendar, HelpCircle } from "lucide-react"
import type { Assessment, Job } from "@/lib/types"
import Link from "next/link"

interface AssessmentsListProps {
  assessments: Assessment[]
  jobs: Job[]
  loading: boolean
  error: string | null
  onAssessmentUpdated: () => void
}

export function AssessmentsList({ assessments, jobs, loading, error, onAssessmentUpdated }: AssessmentsListProps) {
  if (loading || assessments.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {assessments.map((assessment) => {
        const job = jobs.find((j) => j.id === assessment.jobId)
        const totalQuestions = assessment.sections.reduce((total, section) => total + section.questions.length, 0)

        return (
          <Card key={assessment.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl text-card-foreground">{assessment.title}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {assessment.sections.length} section{assessment.sections.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {job && (
                    <p className="text-sm text-muted-foreground mb-2">
                      Assessment for: <span className="font-medium">{job.title}</span>
                    </p>
                  )}

                  {assessment.description && (
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{assessment.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <HelpCircle className="h-4 w-4" />
                      {totalQuestions} question{totalQuestions !== 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Updated {new Date(assessment.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/assessments/builder/${assessment.id}`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {assessment.sections.map((section, index) => (
                  <div key={section.id} className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      Section {index + 1}
                    </Badge>
                    <span className="text-sm text-card-foreground">{section.title}</span>
                    <span className="text-xs text-muted-foreground">
                      ({section.questions.length} question{section.questions.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
