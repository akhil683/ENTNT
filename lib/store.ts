import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Job, Candidate, Assessment } from "./types";

interface AppState {
  // Jobs
  jobs: Job[];
  selectedJob: Job | null;
  jobsLoading: boolean;
  jobsError: string | null;

  // Candidates
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  candidatesLoading: boolean;
  candidatesError: string | null;

  // Assessments
  assessments: Assessment[];
  selectedAssessment: Assessment | null;
  assessmentsLoading: boolean;
  assessmentsError: string | null;

  // Actions
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  updateJobs: (changes: { id: string; changes: Partial<Job> }[]) => void;
  deleteJob: (id: string) => void;
  setSelectedJob: (job: Job | null) => void;
  setJobsLoading: (loading: boolean) => void;
  setJobsError: (error: string | null) => void;

  setCandidates: (candidates: Candidate[]) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  setCandidatesLoading: (loading: boolean) => void;
  setCandidatesError: (error: string | null) => void;

  setAssessments: (assessments: Assessment[]) => void;
  addAssessment: (assessment: Assessment) => void;
  updateAssessment: (id: string, updates: Partial<Assessment>) => void;
  setSelectedAssessment: (assessment: Assessment | null) => void;
  setAssessmentsLoading: (loading: boolean) => void;
  setAssessmentsError: (error: string | null) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        jobs: [],
        selectedJob: null,
        jobsLoading: false,
        jobsError: null,

        candidates: [],
        selectedCandidate: null,
        candidatesLoading: false,
        candidatesError: null,

        assessments: [],
        selectedAssessment: null,
        assessmentsLoading: false,
        assessmentsError: null,

        // Job actions
        setJobs: (jobs) => set({ jobs }),
        addJob: (job) => set((state) => ({ jobs: [...state.jobs, job] })),
        updateJob: (id, updates) =>
          set((state) => ({
            jobs: state.jobs.map((job) =>
              job.id === id ? { ...job, ...updates } : job,
            ),
          })),
        updateJobs: (updates: { id: string; changes: Partial<Job> }[]) =>
          set((state) => ({
            jobs: state.jobs.map((job) => {
              const found = updates.find((u) => u.id === job.id);
              return found ? { ...job, ...found.changes } : job;
            }),
          })),
        deleteJob: (id) =>
          set((state) => ({
            jobs: state.jobs.filter((job) => job.id !== id),
          })),
        setSelectedJob: (job) => set({ selectedJob: job }),
        setJobsLoading: (loading) => set({ jobsLoading: loading }),
        setJobsError: (error) => set({ jobsError: error }),

        // Candidate actions
        setCandidates: (candidates) => set({ candidates }),
        addCandidate: (candidate) =>
          set((state) => ({ candidates: [...state.candidates, candidate] })),
        updateCandidate: (id, updates) =>
          set((state) => ({
            candidates: state.candidates.map((candidate) =>
              candidate.id === id ? { ...candidate, ...updates } : candidate,
            ),
          })),
        setSelectedCandidate: (candidate) =>
          set({ selectedCandidate: candidate }),
        setCandidatesLoading: (loading) => set({ candidatesLoading: loading }),
        setCandidatesError: (error) => set({ candidatesError: error }),

        // Assessment actions
        setAssessments: (assessments) => set({ assessments }),
        addAssessment: (assessment) =>
          set((state) => ({ assessments: [...state.assessments, assessment] })),
        updateAssessment: (id, updates) =>
          set((state) => ({
            assessments: state.assessments.map((assessment) =>
              assessment.id === id ? { ...assessment, ...updates } : assessment,
            ),
          })),
        setSelectedAssessment: (assessment) =>
          set({ selectedAssessment: assessment }),
        setAssessmentsLoading: (loading) =>
          set({ assessmentsLoading: loading }),
        setAssessmentsError: (error) => set({ assessmentsError: error }),
      }),
      {
        name: "talentflow-storage",
        partialize: (state) => ({
          jobs: state.jobs,
          candidates: state.candidates,
          assessments: state.assessments,
        }),
      },
    ),
  ),
);
