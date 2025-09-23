"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { AssessmentBuilder } from "@/components/assessments/assessment-builder";
import { AssessmentPreview } from "@/components/assessments/assessment-preview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { mockApi } from "@/lib/mock-api";
import type { Assessment } from "@/lib/types";

export default function EditAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const { assessments, jobs } = useAppStore();

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        setLoading(true);
        const existingAssessment = assessments.find(
          (a) => a.id === assessmentId,
        );
        if (existingAssessment) {
          setAssessment(existingAssessment);
        } else {
          setAssessment(null);
        }
      } catch (error) {
        console.error("Failed to load assessment:", error);
        setAssessment(null);
      } finally {
        setLoading(false);
      }
    };

    loadAssessment();
  }, [assessmentId, assessments]);

  const handleSave = async () => {
    if (!assessment) return;

    try {
      setSaving(true);
      await mockApi.saveAssessment(assessment);
      router.push("/assessments");
    } catch (error) {
      console.error("Failed to save assessment:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!assessment) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Assessment Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              The assessment you're looking for doesn't exist or has been
              removed.
            </p>
            <Button
              onClick={() => router.push("/assessments")}
              className="bg-primary hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const job = jobs.find((j) => j.id === assessment.jobId);

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push("/assessments")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="h-6 w-px bg-border" />

            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Edit Assessment
              </h1>
              <p className="text-muted-foreground">
                {job
                  ? `Assessment for ${job.title}`
                  : "Edit assessment details"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="bg-transparent"
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Show Preview
                </>
              )}
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <div
          className={`grid ${showPreview ? "grid-cols-2" : "grid-cols-1"} gap-8`}
        >
          <div>
            <AssessmentBuilder
              assessment={assessment}
              onAssessmentChange={setAssessment}
            />
          </div>

          {showPreview && (
            <div className="border-l border-border pl-8">
              <div className="sticky top-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Live Preview
                </h3>
                <AssessmentPreview assessment={assessment} />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
