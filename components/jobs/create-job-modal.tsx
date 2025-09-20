"use client";

import { useState } from "react";
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
import { X, Plus } from "lucide-react";
import { mockApi } from "@/lib/mock-api";
import type { Job } from "@/lib/types";

const createJobSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  requirements: z.string().optional(),
});

type CreateJobForm = z.infer<typeof createJobSchema>;

interface CreateJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobCreated: (job: Job) => void;
}

export function CreateJobModal({
  open,
  onOpenChange,
  onJobCreated,
}: CreateJobModalProps) {
  const [formData, setFormData] = useState<CreateJobForm>({
    title: "",
    slug: "",
    description: "",
    requirements: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateJobForm, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const handleChange = (field: keyof CreateJobForm, value: string) => {
    let updated = { ...formData, [field]: value };

    // Auto-generate slug when title changes
    if (field === "title") {
      updated.slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim();
    }

    setFormData(updated);
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

      const parsed = createJobSchema.safeParse(formData);
      if (!parsed.success) {
        const fieldErrors: Partial<Record<keyof CreateJobForm, string>> = {};
        parsed.error.errors.forEach((err) => {
          const field = err.path[0] as keyof CreateJobForm;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      const requirements = formData.requirements
        ? formData.requirements.split("\n").filter((req) => req.trim())
        : [];

      const newJob = await mockApi.createJob({
        ...parsed.data,
        requirements,
        status: "active",
        tags,
        order: Date.now(),
      });

      onJobCreated(newJob);
      setFormData({ title: "", slug: "", description: "", requirements: "" });
      setTags([]);
      setTagInput("");
      setErrors({});
    } catch (error) {
      console.error("Failed to create job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job</DialogTitle>
          <DialogDescription>
            Add a new job posting to start attracting candidates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
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

          <div>
            <label className="block text-sm font-medium">Job Description</label>
            <Textarea
              placeholder="Describe the role..."
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="bg-input"
            />
          </div>

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
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                className="cursor-pointer"
              >
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
                      className="ml-1 hover:text-destructive cursor-pointer"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 cursor-pointer"
            >
              {isSubmitting ? "Creating..." : "Create Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
