"use client"

import { useState } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableQuestionBuilder } from "./sortable-question-builder"
import type { Question } from "@/lib/types"
import type { DragEndEvent } from "@dnd-kit/core"

interface DraggableQuestionBuilderProps {
  questions: Question[]
  onQuestionsChange: (questions: Question[]) => void
  onQuestionChange: (questionId: string, question: Question) => void
  onDeleteQuestion: (questionId: string) => void
  allQuestions: Question[]
}

export function DraggableQuestionBuilder({
  questions,
  onQuestionsChange,
  onQuestionChange,
  onDeleteQuestion,
  allQuestions,
}: DraggableQuestionBuilderProps) {
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

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setIsDragging(false)

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = questions.findIndex((question) => question.id === active.id)
    const newIndex = questions.findIndex((question) => question.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const newQuestions = arrayMove(questions, oldIndex, newIndex)
    onQuestionsChange(newQuestions)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={questions.map((question) => question.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {questions.map((question, questionIndex) => (
            <SortableQuestionBuilder
              key={question.id}
              question={question}
              questionIndex={questionIndex}
              isDragging={isDragging}
              onQuestionChange={(updatedQuestion) => onQuestionChange(question.id, updatedQuestion)}
              onDeleteQuestion={() => onDeleteQuestion(question.id)}
              allQuestions={allQuestions}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
