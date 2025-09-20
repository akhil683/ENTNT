import {
  Job,
  Candidate,
  Assessment,
  PaginatedJobsResponse,
  PaginatedCandidatesResponse,
} from "./types";

const API_BASE_URL = "/api";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData,
    );
  }
  return response.json();
}

export class ApiClient {
  // Jobs API
  static async getJobs(
    params: {
      search?: string;
      status?: string;
      page?: number;
      pageSize?: number;
      sort?: string;
    } = {},
  ): Promise<PaginatedJobsResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/jobs?${searchParams}`);
    return handleResponse<PaginatedJobsResponse>(response);
  }

  static async getJob(id: string): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
    return handleResponse<Job>(response);
  }

  static async createJob(
    job: Omit<Job, "id" | "createdAt" | "updatedAt">,
  ): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(job),
    });
    return handleResponse<Job>(response);
  }

  static async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return handleResponse<Job>(response);
  }

  static async reorderJob(
    id: string,
    fromOrder: number,
    toOrder: number,
  ): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/jobs/${id}/reorder`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromOrder, toOrder }),
    });
    return handleResponse<{ success: boolean }>(response);
  }

  // Candidates API
  static async getCandidates(
    params: {
      search?: string;
      stage?: string;
      page?: number;
      pageSize?: number;
    } = {},
  ): Promise<PaginatedCandidatesResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/candidates?${searchParams}`);
    return handleResponse<PaginatedCandidatesResponse>(response);
  }

  static async getCandidate(id: string): Promise<Candidate> {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`);
    return handleResponse<Candidate>(response);
  }

  static async createCandidate(
    candidate: Omit<Candidate, "id" | "appliedAt" | "updatedAt">,
  ): Promise<Candidate> {
    const response = await fetch(`${API_BASE_URL}/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(candidate),
    });
    return handleResponse<Candidate>(response);
  }

  static async updateCandidate(
    id: string,
    updates: Partial<Candidate>,
  ): Promise<Candidate> {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    return handleResponse<Candidate>(response);
  }

  static async getCandidateTimeline(id: string): Promise<
    Array<{
      id: string;
      candidateId: string;
      stage: string;
      timestamp: string;
      notes?: string;
    }>
  > {
    const response = await fetch(`${API_BASE_URL}/candidates/${id}/timeline`);
    return handleResponse(response);
  }

  // Assessments API
  static async getAssessment(jobId: string): Promise<Assessment> {
    const response = await fetch(`${API_BASE_URL}/assessments/${jobId}`);
    return handleResponse<Assessment>(response);
  }

  static async saveAssessment(
    jobId: string,
    assessment: Omit<Assessment, "id" | "createdAt" | "updatedAt">,
  ): Promise<Assessment> {
    const response = await fetch(`${API_BASE_URL}/assessments/${jobId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(assessment),
    });
    return handleResponse<Assessment>(response);
  }

  static async submitAssessmentResponse(
    jobId: string,
    candidateId: string,
    responses: Record<string, any>,
  ): Promise<{ success: boolean; id: string }> {
    const response = await fetch(
      `${API_BASE_URL}/assessments/${jobId}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, responses }),
      },
    );
    return handleResponse(response);
  }

  static async getAssessmentResponse(
    jobId: string,
    candidateId: string,
  ): Promise<{
    id: string;
    candidateId: string;
    assessmentId: string;
    responses: Record<string, any>;
    submittedAt: string;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/assessments/${jobId}/responses/${candidateId}`,
    );
    return handleResponse(response);
  }
}

// Custom hooks for API operations with store integration
import { useJobStore } from "../stores/jobStore";
import { useCandidateStore } from "../stores/candidateStore";
import { useAssessmentStore } from "../stores/assessmentStore";
import { useCallback, useEffect } from "react";

// Jobs hooks
export function useJobsApi() {
  const {
    jobs,
    loading,
    error,
    filters,
    pagination,
    setJobs,
    addJob,
    updateJob,
    removeJob,
    reorderJobs,
    rollbackReorder,
    setLoading,
    setError,
    setPagination,
  } = useJobStore();

  const fetchJobs = useCallback(
    async (params?: Partial<typeof filters>) => {
      try {
        setLoading(true);
        setError(null);

        const searchParams = { ...filters, ...params };
        const response = await ApiClient.getJobs(searchParams);

        setJobs(response.data);
        setPagination(response.pagination);
      } catch (error) {
        const errorMessage =
          error instanceof ApiError ? error.message : "Failed to fetch jobs";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [filters, setJobs, setLoading, setError, setPagination],
  );

  const createJob = useCallback(
    async (jobData: Omit<Job, "id" | "createdAt" | "updatedAt">) => {
      try {
        setLoading(true);
        setError(null);

        const newJob = await ApiClient.createJob(jobData);
        addJob(newJob);

        return newJob;
      } catch (error) {
        const errorMessage =
          error instanceof ApiError ? error.message : "Failed to create job";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addJob, setLoading, setError],
  );

  const editJob = useCallback(
    async (id: string, updates: Partial<Job>) => {
      try {
        setLoading(true);
        setError(null);

        const updatedJob = await ApiClient.updateJob(id, updates);
        updateJob(id, updatedJob);

        return updatedJob;
      } catch (error) {
        const errorMessage =
          error instanceof ApiError ? error.message : "Failed to update job";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [updateJob, setLoading, setError],
  );

  const reorderJob = useCallback(
    async (fromIndex: number, toIndex: number) => {
      const originalJobs = [...jobs];

      try {
        // Optimistic update
        reorderJobs(fromIndex, toIndex);

        const fromJob = originalJobs[fromIndex];
        if (!fromJob) throw new Error("Job not found");

        // Call API
        await ApiClient.reorderJob(fromJob.id, fromIndex, toIndex);
      } catch (error) {
        // Rollback on failure
        rollbackReorder(originalJobs);

        const errorMessage =
          error instanceof ApiError ? error.message : "Failed to reorder job";
        setError(errorMessage);
        throw error;
      }
    },
    [jobs, reorderJobs, rollbackReorder, setError],
  );

  return {
    jobs,
    loading,
    error,
    filters,
    pagination,
    fetchJobs,
    createJob,
    editJob,
    reorderJob,
  };
}

// Candidates hooks
export function useCandidatesApi() {
  const {
    candidates,
    selectedCandidate,
    candidateTimeline,
    loading,
    error,
    filters,
    pagination,
    setCandidates,
    addCandidate,
    updateCandidate,
    setSelectedCandidate,
    setCandidateTimeline,
    moveCandidateStage,
    addCandidateNote,
    setLoading,
    setError,
    setPagination,
  } = useCandidateStore();

  const fetchCandidates = useCallback(
    async (params?: Partial<typeof filters>) => {
      try {
        setLoading(true);
        setError(null);

        const searchParams = { ...filters, ...params };
        const response = await ApiClient.getCandidates(searchParams);

        setCandidates(response.data);
        setPagination(response.pagination);
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "Failed to fetch candidates";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [filters, setCandidates, setLoading, setError, setPagination],
  );

  const fetchCandidate = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const [candidate, timeline] = await Promise.all([
          ApiClient.getCandidate(id),
          ApiClient.getCandidateTimeline(id),
        ]);

        setSelectedCandidate(candidate);
        setCandidateTimeline(id, timeline);

        return candidate;
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "Failed to fetch candidate";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setSelectedCandidate, setCandidateTimeline, setLoading, setError],
  );

  const createCandidate = useCallback(
    async (
      candidateData: Omit<Candidate, "id" | "appliedAt" | "updatedAt">,
    ) => {
      try {
        setLoading(true);
        setError(null);

        const newCandidate = await ApiClient.createCandidate(candidateData);
        addCandidate(newCandidate);

        return newCandidate;
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "Failed to create candidate";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addCandidate, setLoading, setError],
  );

  const editCandidate = useCallback(
    async (id: string, updates: Partial<Candidate>) => {
      try {
        setLoading(true);
        setError(null);

        const updatedCandidate = await ApiClient.updateCandidate(id, updates);
        updateCandidate(id, updatedCandidate);

        return updatedCandidate;
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "Failed to update candidate";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [updateCandidate, setLoading, setError],
  );

  const moveCandidateToStage = useCallback(
    async (candidateId: string, newStage: any) => {
      try {
        // Optimistic update
        moveCandidateStage(candidateId, newStage);

        // Call API
        await ApiClient.updateCandidate(candidateId, { stage: newStage });
      } catch (error) {
        // TODO: Implement rollback mechanism
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "Failed to move candidate";
        setError(errorMessage);
        throw error;
      }
    },
    [moveCandidateStage, setError],
  );

  const addNote = useCallback(
    async (candidateId: string, content: string, author: string) => {
      try {
        // Optimistic update
        addCandidateNote(candidateId, { content, author });

        const candidate = candidates.find((c) => c.id === candidateId);
        if (!candidate) throw new Error("Candidate not found");

        const newNote = {
          id: crypto.randomUUID(),
          content,
          author,
          createdAt: new Date(),
        };

        // Call API
        await ApiClient.updateCandidate(candidateId, {
          notes: [...(candidate.notes || []), newNote],
        });
      } catch (error) {
        // TODO: Implement rollback mechanism
        const errorMessage =
          error instanceof ApiError ? error.message : "Failed to add note";
        setError(errorMessage);
        throw error;
      }
    },
    [candidates, addCandidateNote, setError],
  );

  return {
    candidates,
    selectedCandidate,
    candidateTimeline,
    loading,
    error,
    filters,
    pagination,
    fetchCandidates,
    fetchCandidate,
    createCandidate,
    editCandidate,
    moveCandidateToStage,
    addNote,
  };
}

// Assessments hooks
export function useAssessmentsApi() {
  const {
    assessments,
    assessmentResponses,
    currentAssessment,
    builderState,
    loading,
    error,
    setAssessment,
    updateAssessment,
    setCurrentAssessment,
    setAssessmentResponse,
    submitAssessmentResponse,
    setBuilderState,
    setLoading,
    setError,
  } = useAssessmentStore();

  const fetchAssessment = useCallback(
    async (jobId: string) => {
      try {
        setLoading(true);
        setError(null);

        const assessment = await ApiClient.getAssessment(jobId);
        setAssessment(jobId, assessment);
        setCurrentAssessment(assessment);

        return assessment;
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          // Assessment doesn't exist yet - create a blank one
          const blankAssessment: Assessment = {
            id: crypto.randomUUID(),
            jobId,
            title: "New Assessment",
            description: "",
            sections: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          setAssessment(jobId, blankAssessment);
          setCurrentAssessment(blankAssessment);
          return blankAssessment;
        }

        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "Failed to fetch assessment";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setAssessment, setCurrentAssessment, setLoading, setError],
  );

  const saveAssessment = useCallback(
    async (jobId: string) => {
      const assessment = assessments[jobId];
      if (!assessment) throw new Error("Assessment not found");

      try {
        setLoading(true);
        setError(null);

        const savedAssessment = await ApiClient.saveAssessment(
          jobId,
          assessment,
        );
        setAssessment(jobId, savedAssessment);
        setCurrentAssessment(savedAssessment);
        setBuilderState({ hasUnsavedChanges: false });

        return savedAssessment;
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "Failed to save assessment";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [
      assessments,
      setAssessment,
      setCurrentAssessment,
      setBuilderState,
      setLoading,
      setError,
    ],
  );

  const submitResponse = useCallback(
    async (candidateId: string, assessmentId: string) => {
      const responseKey = `${candidateId}-${assessmentId}`;
      const response = assessmentResponses[responseKey];

      if (!response) throw new Error("No response found");

      try {
        setLoading(true);
        setError(null);

        await ApiClient.submitAssessmentResponse(
          assessmentId,
          candidateId,
          response.responses,
        );
        submitAssessmentResponse(candidateId, assessmentId);
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : "Failed to submit assessment";
        setError(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [assessmentResponses, submitAssessmentResponse, setLoading, setError],
  );

  const saveResponse = useCallback(
    (
      candidateId: string,
      assessmentId: string,
      responses: Record<string, any>,
    ) => {
      setAssessmentResponse(candidateId, assessmentId, responses);
    },
    [setAssessmentResponse],
  );

  return {
    assessments,
    assessmentResponses,
    currentAssessment,
    builderState,
    loading,
    error,
    fetchAssessment,
    saveAssessment,
    submitResponse,
    saveResponse,
    setBuilderState,
  };
}

export { ApiError };
