"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableJobCard } from "./sortable-job-card";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApi } from "@/lib/mock-api";
import { useAppStore } from "@/lib/store";
import type { Job } from "@/lib/types";
import type { DragEndEvent } from "@dnd-kit/core";

interface JobsListDraggableProps {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  onJobUpdated: () => void;
}

export function JobsListDraggable({
  jobs,
  loading,
  error,
  onJobUpdated,
}: JobsListDraggableProps) {
  const [draggedJobs, setDraggedJobs] = useState<Job[]>(jobs);
  const [isDragging, setIsDragging] = useState(false);
  const { updateJob } = useAppStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const sortedJobs = [...jobs].sort((a, b) => a.order - b.order);
    setDraggedJobs(sortedJobs);
  }, [jobs]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setIsDragging(false);

    if (!over || active.id === over.id) return;

    const oldIndex = draggedJobs.findIndex((job) => job.id === active.id);
    const newIndex = draggedJobs.findIndex((job) => job.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newJobs = arrayMove(draggedJobs, oldIndex, newIndex);
    setDraggedJobs(newJobs);

    try {
      const payload = newJobs.map((job, index) => ({
        id: job.id,
        order: index,
      }));

      await mockApi.reorderJobs(payload);
    } catch (error) {
      console.error("Failed to reorder jobs:", error);
      setDraggedJobs(jobs); 
    }
  };

  if (loading || jobs.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={draggedJobs.map((job) => job.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {draggedJobs.map((job) => (
            <SortableJobCard
              key={job.id}
              job={job}
              isDragging={isDragging}
              onJobUpdated={onJobUpdated}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
