"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText } from "lucide-react"
import type { Assessment, Question } from "@/lib/types"

interface AssessmentPreviewProps {
  assessment: Assessment
}

export function AssessmentPreview({ assessment }: AssessmentPreviewProps) {
  const [responses, setResponses] = useState<Record<string, any>>({})

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const shouldShowQuestion = (question: Question): boolean => {
    if (!question.conditionalLogic?.dependsOn) return true

    const dependentResponse = responses[question.conditionalLogic.dependsOn]
    return dependentResponse === question.conditionalLogic.showWhen
  }

  const renderQuestion = (question: Question, questionIndex: number) => {
    if (!shouldShowQuestion(question)) return null

    const response = responses[question.id]

    return (
      <Card key={question.id} className="border-l-2 border-l-primary">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs mt-1">
                {questionIndex + 1}
              </Badge>
              <div className="flex-1">
                <Label className="text-sm font-medium">
                  {question.title}
                  {question.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {question.description && <p className="text-xs text-muted-foreground mt-1">{question.description}</p>}
              </div>
            </div>

            <div className="ml-8">
              {question.type === "single-choice" && (
                <RadioGroup value={response || ""} onValueChange={(value) => handleResponseChange(question.id, value)}>
                  {(question.options || []).map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                      <Label htmlFor={`${question.id}-${index}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {question.type === "multi-choice" && (
                <div className="space-y-2">
                  {(question.options || []).map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${question.id}-${index}`}
                        checked={(response || []).includes(option)}
                        className="bg-gray-500"
                        onCheckedChange={(checked) => {
                          const currentResponse = response || []
                          if (checked) {
                            handleResponseChange(question.id, [...currentResponse, option])
                          } else {
                            handleResponseChange(
                              question.id,
                              currentResponse.filter((item: string) => item !== option),
                            )
                          }
                        }}
                      />
                      <Label htmlFor={`${question.id}-${index}`} className="text-sm">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              {question.type === "short-text" && (
                <Input
                  value={response || ""}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  placeholder="Enter your answer..."
                  className="bg-input"
                  maxLength={question.validation?.maxLength}
                />
              )}

              {question.type === "long-text" && (
                <Textarea
                  value={response || ""}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  placeholder="Enter your detailed response..."
                  rows={4}
                  className="bg-input"
                  maxLength={question.validation?.maxLength}
                />
              )}

              {question.type === "numeric" && (
                <Input
                  type="number"
                  value={response || ""}
                  onChange={(e) => handleResponseChange(question.id, Number.parseInt(e.target.value) || "")}
                  placeholder="Enter a number..."
                  className="bg-input"
                  min={question.validation?.min}
                  max={question.validation?.max}
                />
              )}

              {question.type === "file-upload" && (
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PDF, DOC, DOCX up to 10MB</p>
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    <FileText className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              )}

              {/* Validation feedback */}
              {question.validation && (
                <div className="text-xs text-muted-foreground mt-1">
                  {question.type === "short-text" || question.type === "long-text" ? (
                    <span>
                      {question.validation.minLength && `Min: ${question.validation.minLength} chars`}
                      {question.validation.minLength && question.validation.maxLength && " • "}
                      {question.validation.maxLength && `Max: ${question.validation.maxLength} chars`}
                    </span>
                  ) : null}
                  {question.type === "numeric" ? (
                    <span>
                      {question.validation.min !== undefined && `Min: ${question.validation.min}`}
                      {question.validation.min !== undefined && question.validation.max !== undefined && " • "}
                      {question.validation.max !== undefined && `Max: ${question.validation.max}`}
                    </span>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 max-h-[600px] overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-card-foreground">{assessment.title}</CardTitle>
          {assessment.description && <p className="text-muted-foreground text-sm">{assessment.description}</p>}
        </CardHeader>
      </Card>

      {assessment.sections.map((section) => (
        <div key={section.id} className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-card-foreground">{section.title}</CardTitle>
              {section.description && <p className="text-muted-foreground text-sm">{section.description}</p>}
            </CardHeader>
          </Card>

          <div className="space-y-3">
            {section.questions.map((question, questionIndex) => renderQuestion(question, questionIndex))}
          </div>
        </div>
      ))}

      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">This is a preview. Responses are not saved.</p>
            <Button className="bg-primary hover:bg-primary/90" disabled>
              Submit Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
