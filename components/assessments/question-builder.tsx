"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Trash2, GripVertical, X, ChevronDown } from "lucide-react"
import type { Question, QuestionType } from "@/lib/types"

interface QuestionBuilderProps {
  question: Question
  questionIndex: number
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

export function QuestionBuilder({
  question,
  questionIndex,
  onQuestionChange,
  onDeleteQuestion,
  allQuestions,
}: QuestionBuilderProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

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

  const handleConditionalLogicChange = (field: string, value: any) => {
    onQuestionChange({
      ...question,
      conditionalLogic: {
        ...question.conditionalLogic,
        [field]: value,
      },
    })
  }

  const addOption = () => {
    const currentOptions = question.options || []
    handleQuestionChange("options", [...currentOptions, ""])
  }

  const updateOption = (index: number, value: string) => {
    const currentOptions = question.options || []
    const newOptions = [...currentOptions]
    newOptions[index] = value
    handleQuestionChange("options", newOptions)
  }

  const removeOption = (index: number) => {
    const currentOptions = question.options || []
    handleQuestionChange(
      "options",
      currentOptions.filter((_, i) => i !== index),
    )
  }

  const needsOptions = question.type === "single-choice" || question.type === "multi-choice"
  const questionTypeInfo = questionTypes.find((t) => t.value === question.type)

  const getDependencyLabel = () => {
    if (!question.conditionalLogic?.dependsOn || question.conditionalLogic.dependsOn === "no-dependency") {
      return "No dependency"
    }
    const dependentQuestion = allQuestions.find((q) => q.id === question.conditionalLogic?.dependsOn)
    if (dependentQuestion) {
      const index = allQuestions.findIndex((q) => q.id === dependentQuestion.id)
      return `Q${index + 1}: ${dependentQuestion.title || "Untitled"}`
    }
    return "No dependency"
  }

  return (
    <Card className="border-l-2 border-l-secondary">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
            <Badge variant="outline" className="text-xs">
              Q{questionIndex + 1}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {questionTypeInfo?.label}
            </Badge>
            {question.required && (
              <Badge variant="destructive" className="text-xs">
                Required
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onDeleteQuestion}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic Question Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between bg-input">
                  {questionTypeInfo?.label || "Select type"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {questionTypes.map((type) => (
                  <DropdownMenuItem key={type.value} onClick={() => handleQuestionChange("type", type.value)}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id={`required-${question.id}`}
              checked={question.required}
              onCheckedChange={(checked) => handleQuestionChange("required", checked)}
            />
            <Label htmlFor={`required-${question.id}`}>Required Question</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Question Title</Label>
          <Input
            value={question.title}
            onChange={(e) => handleQuestionChange("title", e.target.value)}
            placeholder="Enter your question..."
            className="bg-input"
          />
        </div>

        <div className="space-y-2">
          <Label>Description (Optional)</Label>
          <Textarea
            value={question.description || ""}
            onChange={(e) => handleQuestionChange("description", e.target.value)}
            placeholder="Provide additional context or instructions..."
            rows={2}
            className="bg-input"
          />
        </div>

        {/* Options for choice questions */}
        {needsOptions && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Answer Options</Label>
              <Button onClick={addOption} variant="outline" size="sm" className="bg-transparent">
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>

            <div className="space-y-2">
              {(question.options || []).map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="bg-input"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {(!question.options || question.options.length === 0) && (
                <div className="text-center py-4 border-2 border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground text-sm mb-2">No options added yet</p>
                  <Button onClick={addOption} variant="outline" size="sm" className="bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Option
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        <div className="border-t border-border pt-4">
          <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)} className="mb-4">
            {showAdvanced ? "Hide" : "Show"} Advanced Settings
          </Button>

          {showAdvanced && (
            <div className="space-y-4">
              {/* Validation Rules */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Validation Rules</Label>

                {question.type === "short-text" || question.type === "long-text" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Min Length</Label>
                      <Input
                        type="number"
                        value={question.validation?.minLength || ""}
                        onChange={(e) =>
                          handleValidationChange("minLength", Number.parseInt(e.target.value) || undefined)
                        }
                        placeholder="0"
                        className="bg-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Max Length</Label>
                      <Input
                        type="number"
                        value={question.validation?.maxLength || ""}
                        onChange={(e) =>
                          handleValidationChange("maxLength", Number.parseInt(e.target.value) || undefined)
                        }
                        placeholder="1000"
                        className="bg-input"
                      />
                    </div>
                  </div>
                ) : null}

                {question.type === "numeric" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Min Value</Label>
                      <Input
                        type="number"
                        value={question.validation?.min || ""}
                        onChange={(e) => handleValidationChange("min", Number.parseInt(e.target.value) || undefined)}
                        placeholder="0"
                        className="bg-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Max Value</Label>
                      <Input
                        type="number"
                        value={question.validation?.max || ""}
                        onChange={(e) => handleValidationChange("max", Number.parseInt(e.target.value) || undefined)}
                        placeholder="100"
                        className="bg-input"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Conditional Logic */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Conditional Logic</Label>
                <p className="text-xs text-muted-foreground">Show this question only when certain conditions are met</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Depends on Question</Label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between bg-input">
                          {getDependencyLabel()}
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleConditionalLogicChange("dependsOn", "no-dependency")}>
                          No dependency
                        </DropdownMenuItem>
                        {allQuestions
                          .filter((q) => q.id !== question.id)
                          .map((q, index) => (
                            <DropdownMenuItem
                              key={q.id}
                              onClick={() => handleConditionalLogicChange("dependsOn", q.id)}
                            >
                              Q{index + 1}: {q.title || "Untitled"}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Show When Answer Is</Label>
                    <Input
                      value={question.conditionalLogic?.showWhen || ""}
                      onChange={(e) => handleConditionalLogicChange("showWhen", e.target.value || undefined)}
                      placeholder="Enter expected answer..."
                      className="bg-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
