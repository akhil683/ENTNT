"use client"

import { useState } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableSectionBuilder } from "./sortable-section-builder"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import type { Assessment, AssessmentSection } from "@/lib/types"
import type { DragEndEvent } from "@dnd-kit/core"

interface DraggableSectionBuilderProps {
  assessment: Assessment
  onAssessmentChange: (assessment: Assessment) => void
}

export function DraggableSectionBuilder({ assessment, onAssessmentChange }: DraggableSectionBuilderProps) {
  const [isDragging, setIsDragging] = useState(false)

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

  const handleAddSection = () => {
    const newSection: AssessmentSection = {
      id: `section-${Date.now()}`,
      title: `Section ${assessment.sections.length + 1}`,
      description: "",
      questions: [],
    }

    onAssessmentChange({
      ...assessment,
      sections: [...assessment.sections, newSection],
      updatedAt: new Date(),
    })
  }

  const handleSectionChange = (sectionId: string, updatedSection: AssessmentSection) => {
    onAssessmentChange({
      ...assessment,
      sections: assessment.sections.map((section) => (section.id === sectionId ? updatedSection : section)),
      updatedAt: new Date(),
    })
  }

  const handleDeleteSection = (sectionId: string) => {
    onAssessmentChange({
      ...assessment,
      sections: assessment.sections.filter((section) => section.id !== sectionId),
      updatedAt: new Date(),
    })
  }

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setIsDragging(false)

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = assessment.sections.findIndex((section) => section.id === active.id)
    const newIndex = assessment.sections.findIndex((section) => section.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newSections = arrayMove(assessment.sections, oldIndex, newIndex)

    onAssessmentChange({
      ...assessment,
      sections: newSections,
      updatedAt: new Date(),
    })
  }

  if (assessment.sections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-card-foreground mb-2">No sections yet</h4>
            <p className="text-muted-foreground mb-4">Add your first section to start building the assessment.</p>
            <Button onClick={handleAddSection} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Assessment Sections</h3>
        <Button onClick={handleAddSection} variant="outline" className="bg-transparent">
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={assessment.sections.map((section) => section.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {assessment.sections.map((section, index) => (
              <SortableSectionBuilder
                key={section.id}
                section={section}
                sectionIndex={index}
                isDragging={isDragging}
                onSectionChange={(updatedSection) => handleSectionChange(section.id, updatedSection)}
                onDeleteSection={() => handleDeleteSection(section.id)}
                allQuestions={assessment.sections.flatMap((s) => s.questions)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}
