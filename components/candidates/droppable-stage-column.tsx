"use client"

import type React from "react"

import { useDroppable } from "@dnd-kit/core"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Candidate } from "@/lib/types"

interface DroppableStageColumnProps {
  stage: {
    value: string
    label: string
    color: string
  }
  candidates: Candidate[]
  children: React.ReactNode
}

export function DroppableStageColumn({ stage, candidates, children }: DroppableStageColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: stage.value,
  })

  return (
    <Card
      ref={setNodeRef}
      className={`${stage.color} min-h-[400px] transition-colors ${isOver ? "ring-2 ring-primary ring-offset-2" : ""}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>{stage.label}</span>
          <Badge variant="secondary" className="text-xs">
            {candidates.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {candidates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground">Drop candidates here</p>
            </div>
          ) : (
            children
          )}
        </div>
      </CardContent>
    </Card>
  )
}
