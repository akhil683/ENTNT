"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DraggableQuestionBuilder } from "./draggable-question-builder"
import { Plus, ChevronDown, ChevronUp, Trash2, GripVertical } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { AssessmentSection, Question } from "@/lib/types"

interface SortableSectionBuilderProps {
  section: AssessmentSection
  sectionIndex: number
  isDragging: boolean
  onSectionChange: (section: AssessmentSection) => void
  onDeleteSection: () => void
  allQuestions: Question[]
}

export function SortableSectionBuilder({
  section,
  sectionIndex,
  isDragging,
  onSectionChange,
  onDeleteSection,
  allQuestions,
}: SortableSectionBuilderProps) {
  const [isOpen, setIsOpen] = useState(true)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCurrentlyDragging,
  } = useSortable({
    id: section.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isCurrentlyDragging ? 0.5 : 1,
  }

  const handleSectionInfoChange = (field: keyof AssessmentSection, value: string) => {
    onSectionChange({
      ...section,
      [field]: value,
    })
  }

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type: "short-text",
      title: "",
      description: "",
      required: false,
    }

    onSectionChange({
      ...section,
      questions: [...section.questions, newQuestion],
    })
  }

  const handleQuestionChange = (questionId: string, updatedQuestion: Question) => {
    onSectionChange({
      ...section,
      questions: section.questions.map((question) => (question.id === questionId ? updatedQuestion : question)),
    })
  }

  const handleDeleteQuestion = (questionId: string) => {
    onSectionChange({
      ...section,
      questions: section.questions.filter((question) => question.id !== questionId),
    })
  }

  const handleQuestionsReorder = (newQuestions: Question[]) => {
    onSectionChange({
      ...section,
      questions: newQuestions,
    })
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`border-l-4 border-l-primary ${isCurrentlyDragging ? "shadow-lg" : ""} ${
        isDragging && !isCurrentlyDragging ? "opacity-50" : ""
      }`}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
              >
                <GripVertical className="h-5 w-5" />
              </div>

              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto">
                  <CardTitle className="text-card-foreground">
                    Section {sectionIndex + 1}: {section.title || "Untitled Section"}
                  </CardTitle>
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {section.questions.length} question{section.questions.length !== 1 ? "s" : ""}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeleteSection}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Section Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`section-title-${section.id}`}>Section Title</Label>
                <Input
                  id={`section-title-${section.id}`}
                  value={section.title}
                  onChange={(e) => handleSectionInfoChange("title", e.target.value)}
                  placeholder="Enter section title..."
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`section-description-${section.id}`}>Description (Optional)</Label>
                <Textarea
                  id={`section-description-${section.id}`}
                  value={section.description || ""}
                  onChange={(e) => handleSectionInfoChange("description", e.target.value)}
                  placeholder="Describe this section..."
                  rows={2}
                  className="bg-input"
                />
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-card-foreground">Questions</h4>
                <Button onClick={handleAddQuestion} variant="outline" size="sm" className="bg-transparent">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {section.questions.length > 0 ? (
                <DraggableQuestionBuilder
                  questions={section.questions}
                  onQuestionsChange={handleQuestionsReorder}
                  onQuestionChange={handleQuestionChange}
                  onDeleteQuestion={handleDeleteQuestion}
                  allQuestions={allQuestions}
                />
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground mb-4">No questions in this section yet.</p>
                  <Button onClick={handleAddQuestion} variant="outline" className="bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Question
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
