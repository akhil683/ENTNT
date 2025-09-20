"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Archive,
  ArchiveRestore,
  Users,
  Calendar,
} from "lucide-react";
import { EditJobModal } from "@/components/jobs/edit-job-modal";
import { mockApi } from "@/lib/mock-api";
import { useAppStore } from "@/lib/store";
import type { Job } from "@/lib/types";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const { jobs, updateJob } = useAppStore();

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        // First try to find in store
        const existingJob = jobs.find((j) => j.id === jobId);
        if (existingJob) {
          setJob(existingJob);
        } else {
          // In a real app, you'd fetch from API
          // For now, we'll simulate not found
          setJob(null);
        }
      } catch (error) {
        console.error("Failed to load job:", error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId, jobs]);

  const handleArchiveToggle = async () => {
    if (!job) return;

    try {
      setUpdating(true);
      const newStatus =
        job.status === "active"
          ? "archived"
          : ("active" as "active" | "archived");

      await mockApi.updateJob(job.id, { status: newStatus });
      const updatedJob = { ...job, status: newStatus };
      setJob(updatedJob);
      updateJob(job.id, { status: newStatus });
    } catch (error) {
      console.error("Failed to update job status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleJobUpdated = (updatedJob: Job) => {
    setJob(updatedJob);
    updateJob(updatedJob.id, updatedJob);
    setEditModalOpen(false);
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Job Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => router.push("/jobs")}
              className="bg-primary hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/jobs")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {job.title}
                </h1>
                <Badge
                  variant={job.status === "active" ? "default" : "secondary"}
                  className={
                    job.status === "active"
                      ? "bg-primary text-primary-foreground"
                      : ""
                  }
                >
                  {job.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">Job ID: {job.slug}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditModalOpen(true)}
                className="bg-transparent"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleArchiveToggle}
                disabled={updating}
                className="bg-transparent"
              >
                {job.status === "active" ? (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </>
                ) : (
                  <>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Restore
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {job.description || "No description provided."}
                </p>
              </CardContent>
            </Card>

            {job.requirements && job.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-card-foreground">
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {requirement}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.tags.length > 0 ? (
                    job.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No tags added.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Job Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-card-foreground">
                      {Math.floor(Math.random() * 50) + 10}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Applicants
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-card-foreground">
                      {job.createdAt.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Date Posted</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-card-foreground">
                      {job.updatedAt.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Last Updated
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push(`/candidates?job=${job.id}`)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Candidates
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push(`/assessments?job=${job.id}`)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {editModalOpen && (
          <EditJobModal
            job={job}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onJobUpdated={handleJobUpdated}
          />
        )}
      </div>
    </main>
  );
}
