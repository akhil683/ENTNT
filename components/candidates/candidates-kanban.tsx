"use client"

import { CandidatesKanbanDraggable } from "./candidates-kanban-draggable"
import type { Candidate } from "@/lib/types"

interface CandidatesKanbanProps {
  candidates: Candidate[]
  loading: boolean
  error: string | null
  onCandidateUpdated: (candidate: Candidate) => void
}

export function CandidatesKanban({ candidates, loading, error, onCandidateUpdated }: CandidatesKanbanProps) {
  return (
    <CandidatesKanbanDraggable
      candidates={candidates}
      loading={loading}
      error={error}
      onCandidateUpdated={onCandidateUpdated}
    />
  )
}
