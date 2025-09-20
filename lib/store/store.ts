import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Job } from "../types";

interface JobFilters {
  search: string;
  status: string;
  page: number;
  pageSize: number;
  sort: string;
}

interface JobStore {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  filters: JobFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  // Actions
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  removeJob: (id: string) => void;
  reorderJobs: (fromIndex: number, toIndex: number) => void;
  rollbackReorder: (originalJobs: Job[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<JobFilters>) => void;
  setPagination: (pagination: Partial<JobStore["pagination"]>) => void;
  clearJobs: () => void;
}

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      jobs: [],
      loading: false,
      error: null,
      filters: {
        search: "",
        status: "",
        page: 1,
        pageSize: 10,
        sort: "order",
      },
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
      },

      setJobs: (jobs) => set({ jobs }),

      addJob: (job) =>
        set((state) => ({
          jobs: [...state.jobs, job],
        })),

      updateJob: (id, updates) =>
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, ...updates } : job,
          ),
        })),

      removeJob: (id) =>
        set((state) => ({
          jobs: state.jobs.filter((job) => job.id !== id),
        })),

      reorderJobs: (fromIndex, toIndex) =>
        set((state) => {
          const newJobs = [...state.jobs];
          const [moved] = newJobs.splice(fromIndex, 1);
          newJobs.splice(toIndex, 0, moved);

          // Update order values
          return {
            jobs: newJobs.map((job, index) => ({
              ...job,
              order: index,
            })),
          };
        }),

      rollbackReorder: (originalJobs) => set({ jobs: originalJobs }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),

      clearJobs: () => set({ jobs: [], error: null, loading: false }),
    }),
    {
      name: "job-store",
      partialize: (state) => ({
        jobs: state.jobs,
        filters: state.filters,
        pagination: state.pagination,
      }),
    },
  ),
);
