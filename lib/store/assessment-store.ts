import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Assessment, Question, AssessmentSection } from "../types";

interface AssessmentResponse {
  candidateId: string;
  assessmentId: string;
  responses: Record<string, any>;
  submittedAt?: Date;
}

interface AssessmentStore {
  assessments: Record<string, Assessment>;
  assessmentResponses: Record<string, AssessmentResponse>;
  currentAssessment: Assessment | null;
  builderState: {
    jobId: string | null;
    isEditing: boolean;
    hasUnsavedChanges: boolean;
  };
  loading: boolean;
  error: string | null;

  // Actions
  setAssessment: (jobId: string, assessment: Assessment) => void;
  updateAssessment: (jobId: string, updates: Partial<Assessment>) => void;
  addSection: (jobId: string, section: AssessmentSection) => void;
  updateSection: (
    jobId: string,
    sectionId: string,
    updates: Partial<AssessmentSection>,
  ) => void;
  removeSection: (jobId: string, sectionId: string) => void;
  addQuestion: (jobId: string, sectionId: string, question: Question) => void;
  updateQuestion: (
    jobId: string,
    sectionId: string,
    questionId: string,
    updates: Partial<Question>,
  ) => void;
  removeQuestion: (
    jobId: string,
    sectionId: string,
    questionId: string,
  ) => void;
  reorderQuestions: (
    jobId: string,
    sectionId: string,
    fromIndex: number,
    toIndex: number,
  ) => void;

  setCurrentAssessment: (assessment: Assessment | null) => void;
  setAssessmentResponse: (
    candidateId: string,
    assessmentId: string,
    responses: Record<string, any>,
  ) => void;
  submitAssessmentResponse: (candidateId: string, assessmentId: string) => void;

  setBuilderState: (state: Partial<AssessmentStore["builderState"]>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAssessments: () => void;
}

export const useAssessmentStore = create<AssessmentStore>()(
  persist(
    (set, get) => ({
      assessments: {},
      assessmentResponses: {},
      currentAssessment: null,
      builderState: {
        jobId: null,
        isEditing: false,
        hasUnsavedChanges: false,
      },
      loading: false,
      error: null,

      setAssessment: (jobId, assessment) =>
        set((state) => ({
          assessments: {
            ...state.assessments,
            [jobId]: assessment,
          },
        })),

      updateAssessment: (jobId, updates) =>
        set((state) => {
          const existing = state.assessments[jobId];
          if (!existing) return state;

          const updated = {
            ...existing,
            ...updates,
            updatedAt: new Date(),
          };

          return {
            assessments: {
              ...state.assessments,
              [jobId]: updated,
            },
            currentAssessment:
              state.currentAssessment?.id === existing.id
                ? updated
                : state.currentAssessment,
            builderState: {
              ...state.builderState,
              hasUnsavedChanges: true,
            },
          };
        }),

      addSection: (jobId, section) =>
        set((state) => {
          const assessment = state.assessments[jobId];
          if (!assessment) return state;

          const updated = {
            ...assessment,
            sections: [...assessment.sections, section],
            updatedAt: new Date(),
          };

          return {
            assessments: {
              ...state.assessments,
              [jobId]: updated,
            },
            currentAssessment:
              state.currentAssessment?.id === assessment.id
                ? updated
                : state.currentAssessment,
            builderState: {
              ...state.builderState,
              hasUnsavedChanges: true,
            },
          };
        }),

      updateSection: (jobId, sectionId, updates) =>
        set((state) => {
          const assessment = state.assessments[jobId];
          if (!assessment) return state;

          const updated = {
            ...assessment,
            sections: assessment.sections.map((section) =>
              section.id === sectionId ? { ...section, ...updates } : section,
            ),
            updatedAt: new Date(),
          };

          return {
            assessments: {
              ...state.assessments,
              [jobId]: updated,
            },
            currentAssessment:
              state.currentAssessment?.id === assessment.id
                ? updated
                : state.currentAssessment,
            builderState: {
              ...state.builderState,
              hasUnsavedChanges: true,
            },
          };
        }),

      removeSection: (jobId, sectionId) =>
        set((state) => {
          const assessment = state.assessments[jobId];
          if (!assessment) return state;

          const updated = {
            ...assessment,
            sections: assessment.sections.filter(
              (section) => section.id !== sectionId,
            ),
            updatedAt: new Date(),
          };

          return {
            assessments: {
              ...state.assessments,
              [jobId]: updated,
            },
            currentAssessment:
              state.currentAssessment?.id === assessment.id
                ? updated
                : state.currentAssessment,
            builderState: {
              ...state.builderState,
              hasUnsavedChanges: true,
            },
          };
        }),

      addQuestion: (jobId, sectionId, question) =>
        set((state) => {
          const assessment = state.assessments[jobId];
          if (!assessment) return state;

          const updated = {
            ...assessment,
            sections: assessment.sections.map((section) =>
              section.id === sectionId
                ? { ...section, questions: [...section.questions, question] }
                : section,
            ),
            updatedAt: new Date(),
          };

          return {
            assessments: {
              ...state.assessments,
              [jobId]: updated,
            },
            currentAssessment:
              state.currentAssessment?.id === assessment.id
                ? updated
                : state.currentAssessment,
            builderState: {
              ...state.builderState,
              hasUnsavedChanges: true,
            },
          };
        }),

      updateQuestion: (jobId, sectionId, questionId, updates) =>
        set((state) => {
          const assessment = state.assessments[jobId];
          if (!assessment) return state;

          const updated = {
            ...assessment,
            sections: assessment.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    questions: section.questions.map((question) =>
                      question.id === questionId
                        ? { ...question, ...updates }
                        : question,
                    ),
                  }
                : section,
            ),
            updatedAt: new Date(),
          };

          return {
            assessments: {
              ...state.assessments,
              [jobId]: updated,
            },
            currentAssessment:
              state.currentAssessment?.id === assessment.id
                ? updated
                : state.currentAssessment,
            builderState: {
              ...state.builderState,
              hasUnsavedChanges: true,
            },
          };
        }),

      removeQuestion: (jobId, sectionId, questionId) =>
        set((state) => {
          const assessment = state.assessments[jobId];
          if (!assessment) return state;

          const updated = {
            ...assessment,
            sections: assessment.sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    questions: section.questions.filter(
                      (question) => question.id !== questionId,
                    ),
                  }
                : section,
            ),
            updatedAt: new Date(),
          };

          return {
            assessments: {
              ...state.assessments,
              [jobId]: updated,
            },
            currentAssessment:
              state.currentAssessment?.id === assessment.id
                ? updated
                : state.currentAssessment,
            builderState: {
              ...state.builderState,
              hasUnsavedChanges: true,
            },
          };
        }),

      reorderQuestions: (jobId, sectionId, fromIndex, toIndex) =>
        set((state) => {
          const assessment = state.assessments[jobId];
          if (!assessment) return state;

          const updated = {
            ...assessment,
            sections: assessment.sections.map((section) => {
              if (section.id !== sectionId) return section;

              const newQuestions = [...section.questions];
              const [moved] = newQuestions.splice(fromIndex, 1);
              newQuestions.splice(toIndex, 0, moved);

              return { ...section, questions: newQuestions };
            }),
            updatedAt: new Date(),
          };

          return {
            assessments: {
              ...state.assessments,
              [jobId]: updated,
            },
            currentAssessment:
              state.currentAssessment?.id === assessment.id
                ? updated
                : state.currentAssessment,
            builderState: {
              ...state.builderState,
              hasUnsavedChanges: true,
            },
          };
        }),

      setCurrentAssessment: (assessment) =>
        set({ currentAssessment: assessment }),

      setAssessmentResponse: (candidateId, assessmentId, responses) =>
        set((state) => ({
          assessmentResponses: {
            ...state.assessmentResponses,
            [`${candidateId}-${assessmentId}`]: {
              candidateId,
              assessmentId,
              responses,
            },
          },
        })),

      submitAssessmentResponse: (candidateId, assessmentId) =>
        set((state) => {
          const key = `${candidateId}-${assessmentId}`;
          const existing = state.assessmentResponses[key];

          if (!existing) return state;

          return {
            assessmentResponses: {
              ...state.assessmentResponses,
              [key]: {
                ...existing,
                submittedAt: new Date(),
              },
            },
          };
        }),

      setBuilderState: (builderState) =>
        set((state) => ({
          builderState: { ...state.builderState, ...builderState },
        })),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      clearAssessments: () =>
        set({
          assessments: {},
          assessmentResponses: {},
          currentAssessment: null,
          builderState: {
            jobId: null,
            isEditing: false,
            hasUnsavedChanges: false,
          },
          error: null,
          loading: false,
        }),
    }),
    {
      name: "assessment-store",
      partialize: (state) => ({
        assessments: state.assessments,
        assessmentResponses: state.assessmentResponses,
        builderState: state.builderState,
      }),
    },
  ),
);
