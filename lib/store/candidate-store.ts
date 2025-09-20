import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Candidate, CandidateStage } from "../types";

interface CandidateFilters {
  search: string;
  stage: string;
  page: number;
  pageSize: number;
}

interface CandidateTimelineEntry {
  id: string;
  candidateId: string;
  stage: CandidateStage;
  timestamp: string;
  notes?: string;
}

interface CandidateStore {
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  candidateTimeline: Record<string, CandidateTimelineEntry[]>;
  loading: boolean;
  error: string | null;
  filters: CandidateFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  // Actions
  setCandidates: (candidates: Candidate[]) => void;
  addCandidate: (candidate: Candidate) => void;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  removeCandidate: (id: string) => void;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  setCandidateTimeline: (
    candidateId: string,
    timeline: CandidateTimelineEntry[],
  ) => void;
  moveCandidateStage: (candidateId: string, newStage: CandidateStage) => void;
  addCandidateNote: (
    candidateId: string,
    note: { content: string; author: string },
  ) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<CandidateFilters>) => void;
  setPagination: (pagination: Partial<CandidateStore["pagination"]>) => void;
  clearCandidates: () => void;
}

export const useCandidateStore = create<CandidateStore>()(
  persist(
    (set, get) => ({
      candidates: [],
      selectedCandidate: null,
      candidateTimeline: {},
      loading: false,
      error: null,
      filters: {
        search: "",
        stage: "",
        page: 1,
        pageSize: 50,
      },
      pagination: {
        page: 1,
        pageSize: 50,
        total: 0,
        totalPages: 0,
      },

      setCandidates: (candidates) => set({ candidates }),

      addCandidate: (candidate) =>
        set((state) => ({
          candidates: [...state.candidates, candidate],
        })),

      updateCandidate: (id, updates) =>
        set((state) => ({
          candidates: state.candidates.map((candidate) =>
            candidate.id === id ? { ...candidate, ...updates } : candidate,
          ),
          selectedCandidate:
            state.selectedCandidate?.id === id
              ? { ...state.selectedCandidate, ...updates }
              : state.selectedCandidate,
        })),

      removeCandidate: (id) =>
        set((state) => ({
          candidates: state.candidates.filter(
            (candidate) => candidate.id !== id,
          ),
          selectedCandidate:
            state.selectedCandidate?.id === id ? null : state.selectedCandidate,
        })),

      setSelectedCandidate: (candidate) =>
        set({ selectedCandidate: candidate }),

      setCandidateTimeline: (candidateId, timeline) =>
        set((state) => ({
          candidateTimeline: {
            ...state.candidateTimeline,
            [candidateId]: timeline,
          },
        })),

      moveCandidateStage: (candidateId, newStage) =>
        set((state) => {
          const candidate = state.candidates.find((c) => c.id === candidateId);
          if (!candidate) return state;

          const updatedCandidate = {
            ...candidate,
            stage: newStage,
            updatedAt: new Date(),
          };

          return {
            candidates: state.candidates.map((c) =>
              c.id === candidateId ? updatedCandidate : c,
            ),
            selectedCandidate:
              state.selectedCandidate?.id === candidateId
                ? updatedCandidate
                : state.selectedCandidate,
          };
        }),

      addCandidateNote: (candidateId, note) =>
        set((state) => {
          const candidate = state.candidates.find((c) => c.id === candidateId);
          if (!candidate) return state;

          const newNote = {
            id: crypto.randomUUID(),
            content: note.content,
            author: note.author,
            createdAt: new Date(),
          };

          const updatedCandidate = {
            ...candidate,
            notes: [...(candidate.notes || []), newNote],
            updatedAt: new Date(),
          };

          return {
            candidates: state.candidates.map((c) =>
              c.id === candidateId ? updatedCandidate : c,
            ),
            selectedCandidate:
              state.selectedCandidate?.id === candidateId
                ? updatedCandidate
                : state.selectedCandidate,
          };
        }),

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

      clearCandidates: () =>
        set({
          candidates: [],
          selectedCandidate: null,
          candidateTimeline: {},
          error: null,
          loading: false,
        }),
    }),
    {
      name: "candidate-store",
      partialize: (state) => ({
        candidates: state.candidates,
        candidateTimeline: state.candidateTimeline,
        filters: state.filters,
        pagination: state.pagination,
      }),
    },
  ),
);
