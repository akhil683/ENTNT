"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { SectionBuilder } from "./section-builder"
import { Plus, Settings } from "lucide-react"
import type { Assessment, AssessmentSection } from "@/lib/types"

interface AssessmentBuilderProps {
  assessment: Assessment
  onAssessmentChange: (assessment: Assessment) => void
}

export function AssessmentBuilder({ assessment, onAssessmentChange }: AssessmentBuilderProps) {
  const [showSettings, setShowSettings] = useState(false)

  const handleBasicInfoChange = (field: keyof Assessment, value: string) => {
    onAssessmentChange({
      ...assessment,
      [field]: value,
      updatedAt: new Date(),
    })
  }

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

  return (
    <div className="space-y-6">
      {/* Assessment Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Assessment Settings
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="bg-transparent"
            >
              {showSettings ? "Hide" : "Show"} Settings
            </Button>
          </div>
        </CardHeader>

        {showSettings && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Assessment Title</Label>
              <Input
                id="title"
                value={assessment.title}
                onChange={(e) => handleBasicInfoChange("title", e.target.value)}
                placeholder="Enter assessment title..."
                className="bg-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={assessment.description || ""}
                onChange={(e) => handleBasicInfoChange("description", e.target.value)}
                placeholder="Describe what this assessment evaluates..."
                rows={3}
                className="bg-input"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Assessment Sections</h3>
          <Button onClick={handleAddSection} variant="outline" className="bg-transparent">
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>

        {assessment.sections.map((section, index) => (
          <SectionBuilder
            key={section.id}
            section={section}
            sectionIndex={index}
            onSectionChange={(updatedSection) => handleSectionChange(section.id, updatedSection)}
            onDeleteSection={() => handleDeleteSection(section.id)}
            allQuestions={assessment.sections.flatMap((s) => s.questions)}
          />
        ))}

        {assessment.sections.length === 0 && (
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
        )}
      </div>
    </div>
  )
}
