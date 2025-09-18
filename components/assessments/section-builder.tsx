"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { QuestionBuilder } from "./question-builder"
import { Plus, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { AssessmentSection, Question } from "@/lib/types"

interface SectionBuilderProps {
  section: AssessmentSection
  sectionIndex: number
  onSectionChange: (section: AssessmentSection) => void
  onDeleteSection: () => void
  allQuestions: Question[]
}

export function SectionBuilder({
  section,
  sectionIndex,
  onSectionChange,
  onDeleteSection,
  allQuestions,
}: SectionBuilderProps) {
  const [isOpen, setIsOpen] = useState(true)

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

  return (
    <Card className="border-l-4 border-l-primary">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto">
                <CardTitle className="text-card-foreground">
                  Section {sectionIndex + 1}: {section.title || "Untitled Section"}
                </CardTitle>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>

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

              {section.questions.map((question, questionIndex) => (
                <QuestionBuilder
                  key={question.id}
                  question={question}
                  questionIndex={questionIndex}
                  onQuestionChange={(updatedQuestion) => handleQuestionChange(question.id, updatedQuestion)}
                  onDeleteQuestion={() => handleDeleteQuestion(question.id)}
                  allQuestions={allQuestions}
                />
              ))}

              {section.questions.length === 0 && (
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
