"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Archive,
  ArchiveRestore,
  ExternalLink,
  Calendar,
  Users,
  GripVertical,
} from "lucide-react";
import { EditJobModal } from "./edit-job-modal";
import { mockApi } from "@/lib/mock-api";
import { useAppStore } from "@/lib/store";
import type { Job } from "@/lib/types";
import Link from "next/link";

interface SortableJobCardProps {
  job: Job;
  isDragging: boolean;
  onJobUpdated: () => void;
}

export function SortableJobCard({
  job,
  isDragging,
  onJobUpdated,
}: SortableJobCardProps) {
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const { updateJob } = useAppStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCurrentlyDragging,
  } = useSortable({
    id: job.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isCurrentlyDragging ? 0.5 : 1,
  };

  const handleArchiveToggle = async (job: Job) => {
    try {
      setUpdatingJobId(job.id);
      const newStatus = job.status === "active" ? "archived" : "active";

      await mockApi.updateJob(job.id, { status: newStatus });
      updateJob(job.id, { status: newStatus });
      onJobUpdated();
    } catch (error) {
      console.error("Failed to update job status:", error);
    } finally {
      setUpdatingJobId(null);
    }
  };

  const handleJobUpdated = (updatedJob: Job) => {
    updateJob(updatedJob.id, updatedJob);
    setEditingJob(null);
    onJobUpdated();
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        className={`hover:shadow-md transition-shadow ${isCurrentlyDragging ? "shadow-lg" : ""} ${
          isDragging && !isCurrentlyDragging ? "opacity-50" : ""
        }`}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div
                {...attributes}
                {...listeners}
                className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
              >
                <GripVertical className="h-5 w-5" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-xl font-semibold text-card-foreground hover:text-primary transition-colors"
                  >
                    {job.title}
                  </Link>
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

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Created {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {job.description && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {job.description}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={updatingJobId === job.id}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditingJob(job)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/jobs/${job.id}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleArchiveToggle(job)}>
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
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Card>

      {editingJob && (
        <EditJobModal
          job={editingJob}
          open={!!editingJob}
          onOpenChange={(open) => !open && setEditingJob(null)}
          onJobUpdated={handleJobUpdated}
        />
      )}
    </>
  );
}
