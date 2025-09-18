"use client"

import { useState } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DroppableStageColumn } from "./droppable-stage-column"
import { DraggableCandidateCard } from "./draggable-candidate-card"
import { mockApi } from "@/lib/mock-api"
import type { Candidate, CandidateStage } from "@/lib/types"
import type { DragEndEvent } from "@dnd-kit/core"

interface CandidatesKanbanDraggableProps {
  candidates: Candidate[]
  loading: boolean
  error: string | null
  onCandidateUpdated: (candidate: Candidate) => void
}

const stages = [
  { value: "applied", label: "Applied", color: "bg-blue-50 border-blue-200" },
  { value: "screen", label: "Screening", color: "bg-yellow-50 border-yellow-200" },
  { value: "tech", label: "Technical", color: "bg-purple-50 border-purple-200" },
  { value: "offer", label: "Offer", color: "bg-orange-50 border-orange-200" },
  { value: "hired", label: "Hired", color: "bg-green-50 border-green-200" },
  { value: "rejected", label: "Rejected", color: "bg-red-50 border-red-200" },
]

export function CandidatesKanbanDraggable({
  candidates,
  loading,
  error,
  onCandidateUpdated,
}: CandidatesKanbanDraggableProps) {
  const [draggedCandidates, setDraggedCandidates] = useState<Candidate[]>(candidates)
  const [updatingCandidateId, setUpdatingCandidateId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Update local state when candidates prop changes
  useState(() => {
    setDraggedCandidates(candidates)
  }, [candidates])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const candidateId = active.id as string
    const newStage = over.id as CandidateStage

    const candidate = draggedCandidates.find((c) => c.id === candidateId)
    if (!candidate || candidate.stage === newStage) return

    // Optimistic update
    const updatedCandidates = draggedCandidates.map((c) =>
      c.id === candidateId ? { ...c, stage: newStage, updatedAt: new Date() } : c,
    )
    setDraggedCandidates(updatedCandidates)

    try {
      setUpdatingCandidateId(candidateId)
      const updatedCandidate = await mockApi.updateCandidate(candidateId, { stage: newStage })
      onCandidateUpdated(updatedCandidate)
    } catch (error) {
      console.error("Failed to update candidate stage:", error)
      // Rollback on failure
      setDraggedCandidates(candidates)
    } finally {
      setUpdatingCandidateId(null)
    }
  }

  if (loading && candidates.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => (
          <Card key={stage.value} className={stage.color}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-muted rounded animate-pulse w-20" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
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

  // Group candidates by stage
  const candidatesByStage = stages.reduce(
    (acc, stage) => {
      acc[stage.value] = draggedCandidates.filter((candidate) => candidate.stage === stage.value)
      return acc
    },
    {} as Record<string, Candidate[]>,
  )

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stages.map((stage) => {
          const stageCandidates = candidatesByStage[stage.value] || []
          return (
            <DroppableStageColumn key={stage.value} stage={stage} candidates={stageCandidates}>
              <SortableContext items={stageCandidates.map((c) => c.id)} strategy={rectSortingStrategy}>
                {stageCandidates.map((candidate) => (
                  <DraggableCandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isUpdating={updatingCandidateId === candidate.id}
                  />
                ))}
              </SortableContext>
            </DroppableStageColumn>
          )
        })}
      </div>
    </DndContext>
  )
}
