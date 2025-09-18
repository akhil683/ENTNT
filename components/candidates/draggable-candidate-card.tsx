"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Calendar, MessageSquare, GripVertical } from "lucide-react"
import { useAppStore } from "@/lib/store"
import type { Candidate } from "@/lib/types"
import Link from "next/link"

interface DraggableCandidateCardProps {
  candidate: Candidate
  isUpdating: boolean
}

export function DraggableCandidateCard({ candidate, isUpdating }: DraggableCandidateCardProps) {
  const { jobs } = useAppStore()
  const job = jobs.find((j) => j.id === candidate.jobId)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`mb-3 hover:shadow-md transition-shadow cursor-pointer ${isDragging ? "shadow-lg" : ""} ${
        isUpdating ? "opacity-50" : ""
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                {getInitials(candidate.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <Link
                href={`/candidates/${candidate.id}`}
                className="font-medium text-sm text-card-foreground hover:text-primary transition-colors block truncate"
              >
                {candidate.name}
              </Link>
            </div>
          </div>

          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <GripVertical className="h-3 w-3" />
          </div>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            <span className="truncate">{candidate.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{candidate.appliedAt.toLocaleDateString()}</span>
          </div>
          {job && <p className="truncate">Applied for: {job.title}</p>}
          {candidate.notes && candidate.notes.length > 0 && (
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{candidate.notes.length} note(s)</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
