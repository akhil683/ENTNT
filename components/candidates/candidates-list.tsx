"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MoreHorizontal, Mail, Calendar, MessageSquare, ExternalLink } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { mockApi } from "@/lib/mock-api"
import type { Candidate, CandidateStage } from "@/lib/types"
import Link from "next/link"

interface CandidatesListProps {
  candidates: Candidate[]
  loading: boolean
  error: string | null
  onCandidateUpdated: (candidate: Candidate) => void
}

const stages = [
  { value: "applied", label: "Applied", color: "bg-blue-100 text-blue-800" },
  { value: "screen", label: "Screening", color: "bg-yellow-100 text-yellow-800" },
  { value: "tech", label: "Technical", color: "bg-purple-100 text-purple-800" },
  { value: "offer", label: "Offer", color: "bg-orange-100 text-orange-800" },
  { value: "hired", label: "Hired", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
]

interface CandidateCardProps {
  candidate: Candidate
  job: any
  onStageChange: (candidate: Candidate, newStage: CandidateStage) => void
}

function CandidateCard({ candidate, job, onStageChange }: CandidateCardProps) {
  const stage = stages.find((s) => s.value === candidate.stage)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card className="hover:shadow-md transition-shadow mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/candidates/${candidate.id}`}
                  className="font-medium text-card-foreground hover:text-primary transition-colors truncate"
                >
                  {candidate.name}
                </Link>
                {stage && (
                  <Badge variant="secondary" className={`text-xs ${stage.color}`}>
                    {stage.label}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{candidate.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Applied {new Date(candidate.appliedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {job && <p className="text-xs text-muted-foreground mt-1">Applied for: {job.title}</p>}

              {candidate.notes && candidate.notes.length > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <MessageSquare className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{candidate.notes.length} note(s)</span>
                </div>
              )}
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
                <Link href={`/candidates/${candidate.id}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Profile
                </Link>
              </DropdownMenuItem>
              {stages
                .filter((s) => s.value !== candidate.stage)
                .map((stage) => (
                  <DropdownMenuItem
                    key={stage.value}
                    onClick={() => onStageChange(candidate, stage.value as CandidateStage)}
                  >
                    Move to {stage.label}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

export function CandidatesList({ candidates, loading, error, onCandidateUpdated }: CandidatesListProps) {
  const [updatingCandidateId, setUpdatingCandidateId] = useState<string | null>(null)
  const { jobs } = useAppStore()

  const handleStageChange = async (candidate: Candidate, newStage: CandidateStage) => {
    try {
      setUpdatingCandidateId(candidate.id)
      const updatedCandidate = await mockApi.updateCandidate(candidate.id, { stage: newStage })
      onCandidateUpdated(updatedCandidate)
    } catch (error) {
      console.error("Failed to update candidate stage:", error)
    } finally {
      setUpdatingCandidateId(null)
    }
  }

  if (loading && candidates.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
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

  if (candidates.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-card-foreground mb-2">No candidates found</h3>
            <p className="text-muted-foreground">Try adjusting your filters to see more candidates.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-h-[600px] overflow-y-auto space-y-4 pr-2">
      {candidates.map((candidate) => {
        const job = jobs.find((j) => j.id === candidate.jobId)
        return <CandidateCard key={candidate.id} candidate={candidate} job={job} onStageChange={handleStageChange} />
      })}
    </div>
  )
}
