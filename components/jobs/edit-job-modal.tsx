"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X, Plus, ChevronDown } from "lucide-react";
import { mockApi } from "@/lib/mock-api";
import type { Job } from "@/lib/types";

const editJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  requirements: z.string().optional(),
  status: z.enum(["active", "archived"]),
});

type EditJobForm = z.infer<typeof editJobSchema>;

interface EditJobModalProps {
  job: Job;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobUpdated: (job: Job) => void;
}

export function EditJobModal({
  job,
  open,
  onOpenChange,
  onJobUpdated,
}: EditJobModalProps) {
  const [formData, setFormData] = useState<EditJobForm>({
    title: job.title,
    slug: job.slug,
    description: job.description || "",
    requirements: job.requirements?.join("\n") || "",
    status: job.status,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof EditJobForm, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>(job.tags || []);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        slug: job.slug,
        description: job.description || "",
        requirements: job.requirements?.join("\n") || "",
        status: job.status,
      });
      setTags(job.tags || []);
    }
  }, [job]);

  const handleChange = (field: keyof EditJobForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);

      const parsed = editJobSchema.safeParse(formData);
      if (!parsed.success) {
        const fieldErrors: Partial<Record<keyof EditJobForm, string>> = {};
        parsed.error.errors.forEach((err) => {
          const field = err.path[0] as keyof EditJobForm;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      const requirements = formData.requirements
        ? formData.requirements.split("\n").filter((req) => req.trim())
        : [];

      const updatedJob = await mockApi.updateJob(job.id, {
        ...parsed.data,
        requirements,
        tags,
      });

      onJobUpdated(updatedJob);
      setErrors({});
    } catch (error) {
      console.error("Failed to update job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job</DialogTitle>
          <DialogDescription>
            Update the job details and requirements.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium">Job Title *</label>
            <Input
              placeholder="e.g. Senior Frontend Developer"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="bg-input"
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium">URL Slug *</label>
            <Input
              placeholder="senior-frontend-developer"
              value={formData.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              className="bg-input"
            />
            {errors.slug && (
              <p className="text-red-500 text-sm">{errors.slug}</p>
            )}
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="block text-sm font-medium">Status</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between bg-input"
                >
                  {formData.status === "active" ? "Active" : "Archived"}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => handleChange("status", "active")}
                >
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleChange("status", "archived")}
                >
                  Archived
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium">Job Description</label>
            <Textarea
              placeholder="Describe the role, responsibilities..."
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="bg-input"
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium">Requirements</label>
            <Textarea
              placeholder="List requirements, one per line..."
              rows={4}
              value={formData.requirements}
              onChange={(e) => handleChange("requirements", e.target.value)}
              className="bg-input"
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-input"
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Updating..." : "Update Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
