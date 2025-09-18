import { z } from "zod"

// Job schemas
export const JobStatus = z.enum(["active", "archived"])
export const JobSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  status: JobStatus,
  tags: z.array(z.string()),
  order: z.number(),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Job = z.infer<typeof JobSchema>

// Candidate schemas
export const CandidateStage = z.enum(["applied", "screen", "tech", "offer", "hired", "rejected"])
export const CandidateSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  stage: CandidateStage,
  jobId: z.string(),
  appliedAt: z.date(),
  updatedAt: z.date(),
  notes: z
    .array(
      z.object({
        id: z.string(),
        content: z.string(),
        createdAt: z.date(),
        author: z.string(),
      }),
    )
    .optional(),
})

export type Candidate = z.infer<typeof CandidateSchema>

// Assessment schemas
export const QuestionType = z.enum([
  "single-choice",
  "multi-choice",
  "short-text",
  "long-text",
  "numeric",
  "file-upload",
])

export const QuestionSchema = z.object({
  id: z.string(),
  type: QuestionType,
  title: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(), // For choice questions
  validation: z
    .object({
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
  conditionalLogic: z
    .object({
      dependsOn: z.string(), // Question ID
      showWhen: z.string(), // Value to match
    })
    .optional(),
})

export const AssessmentSectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  questions: z.array(QuestionSchema),
})

export const AssessmentSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  sections: z.array(AssessmentSectionSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Question = z.infer<typeof QuestionSchema>
export type AssessmentSection = z.infer<typeof AssessmentSectionSchema>
export type Assessment = z.infer<typeof AssessmentSchema>

// API Response schemas
export const PaginatedResponse = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      total: z.number(),
      totalPages: z.number(),
    }),
  })

export type PaginatedJobsResponse = z.infer<ReturnType<typeof PaginatedResponse<typeof JobSchema>>>
export type PaginatedCandidatesResponse = z.infer<ReturnType<typeof PaginatedResponse<typeof CandidateSchema>>>
