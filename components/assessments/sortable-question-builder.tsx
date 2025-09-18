"use client"

import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import type { Question, QuestionType } from "@/lib/types"

interface SortableQuestionBuilderProps {
  question: Question
  questionIndex: number
  isDragging: boolean
  onQuestionChange: (question: Question) => void
  onDeleteQuestion: () => void
  allQuestions: Question[]
}

const questionTypes: { value: QuestionType; label: string; description: string }[] = [
  { value: "single-choice", label: "Single Choice", description: "Select one option" },
  { value: "multi-choice", label: "Multiple Choice", description: "Select multiple options" },
  { value: "short-text", label: "Short Text", description: "Brief text response" },
  { value: "long-text", label: "Long Text", description: "Detailed text response" },
  { value: "numeric", label: "Numeric", description: "Number input with range" },
  { value: "file-upload", label: "File Upload", description: "Upload documents or files" },
]

export function SortableQuestionBuilder({
  question,
  questionIndex,
  isDragging,
  onQuestionChange,
  onDeleteQuestion,
  allQuestions,
}: SortableQuestionBuilderProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCurrentlyDragging,
  } = useSortable({
    id: question.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isCurrentlyDragging ? 0.5 : 1,
  }

  const handleQuestionChange = (field: keyof Question, value: any) => {
    onQuestionChange({
      ...question,
      [field]: value,
    })
  }

  const handleValidationChange = (field: string, value: any) => {
    onQuestionChange({
      ...question,
      validation: {
        ...question.validation,
        [field]: value,
      },
    })
  }

  const handleConditionalChange = (field: string, value: any) => {
    onQuestionChange({
      ...question,
      conditional: {
        ...question.conditional,
        [field]: value,
      },
    })
  }

  const addOption = () => {
    if (question.type === "single-choice" || question.type === "multi-choice") {
      const newOptions = [...(question.options || []), ""]
      handleQuestionChange("options", newOptions)
    }
  }

  const updateOption = (index: number, value: string) => {
    if (question.type === "single-choice" || question.type === "multi-choice") {
      const newOptions = [...(question.options || [])]
      newOptions[index] = value
      handleQuestionChange("options", newOptions)
    }
  }

  const removeOption = (index: number) => {
    if (question.type === "single-choice" || question.type === "multi-choice") {
      const newOptions = question.options?.filter((_, i) => i !== index) || []
      handleQuestionChange("options", newOptions)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-4 ${isDragging ? "shadow-lg" : ""}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-500">Question {questionIndex + 1}</span>
        </div>
        <button onClick={onDeleteQuestion} className="text-red-500 hover:text-red-700 p-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
          <input
            type="text"
            value={question.text}
            onChange={(e) => handleQuestionChange("text", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="Enter your question..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between bg-transparent">
                {questionTypes.find((type) => type.value === question.type)?.label || "Select type"}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              {questionTypes.map((type) => (
                <DropdownMenuItem
                  key={type.value}
                  onClick={() => handleQuestionChange("type", type.value as QuestionType)}
                >
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.description}</div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {(question.type === "single-choice" || question.type === "multi-choice") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
            <div className="space-y-2">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button onClick={() => removeOption(index)} className="text-red-500 hover:text-red-700 p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              <button onClick={addOption} className="text-cyan-600 hover:text-cyan-800 text-sm font-medium">
                + Add Option
              </button>
            </div>
          </div>
        )}

        {question.type === "numeric" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
              <input
                type="number"
                value={question.validation?.min || ""}
                onChange={(e) => handleValidationChange("min", Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
              <input
                type="number"
                value={question.validation?.max || ""}
                onChange={(e) => handleValidationChange("max", Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={question.validation?.required || false}
              onChange={(e) => handleValidationChange("required", e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Required</span>
          </label>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-cyan-600 hover:text-cyan-800 text-sm font-medium"
          >
            {showAdvanced ? "Hide" : "Show"} Advanced Options
          </button>
        </div>

        {showAdvanced && (
          <div className="border-t pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Help Text</label>
              <input
                type="text"
                value={question.helpText || ""}
                onChange={(e) => handleQuestionChange("helpText", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Additional guidance for this question..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Conditional Logic</label>
              <div className="space-y-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-transparent">
                      {question.conditional?.dependsOn
                        ? allQuestions.find((q) => q.id === question.conditional?.dependsOn)?.text || "Unknown question"
                        : "No dependency"}
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => handleConditionalChange("dependsOn", "")}>
                      No dependency
                    </DropdownMenuItem>
                    {allQuestions
                      .filter((q, index) => index < questionIndex)
                      .map((q, index) => (
                        <DropdownMenuItem key={q.id} onClick={() => handleConditionalChange("dependsOn", q.id)}>
                          Question {index + 1}: {q.text}
                        </DropdownMenuItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {question.conditional?.dependsOn && (
                  <input
                    type="text"
                    value={question.conditional?.showWhen || ""}
                    onChange={(e) => handleConditionalChange("showWhen", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Show when answer equals..."
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
