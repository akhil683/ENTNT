import Dexie, { Table } from "dexie";
import { Job, Candidate, Assessment } from "../types";

export interface JobDB extends Omit<Job, "createdAt" | "updatedAt"> {
  createdAt: string;
  updatedAt: string;
}

export interface CandidateDB
  extends Omit<Candidate, "appliedAt" | "updatedAt" | "notes"> {
  appliedAt: string;
  updatedAt: string;
  notes?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: string;
  }>;
}

export interface AssessmentDB
  extends Omit<Assessment, "createdAt" | "updatedAt"> {
  createdAt: string;
  updatedAt: string;
}

export interface CandidateTimelineEntry {
  id: string;
  candidateId: string;
  stage: string;
  timestamp: string;
  notes?: string;
}

export interface AssessmentResponse {
  id: string;
  candidateId: string;
  assessmentId: string;
  responses: Record<string, any>;
  submittedAt: string;
}

export class TalentFlowDB extends Dexie {
  jobs!: Table<JobDB>;
  candidates!: Table<CandidateDB>;
  assessments!: Table<AssessmentDB>;
  candidateTimeline!: Table<CandidateTimelineEntry>;
  assessmentResponses!: Table<AssessmentResponse>;

  constructor() {
    super("TalentFlowDB");
    this.version(1).stores({
      jobs: "id, title, slug, status, order, *tags",
      candidates: "id, name, email, stage, jobId",
      assessments: "id, jobId",
      candidateTimeline: "id, candidateId, stage, timestamp",
      assessmentResponses: "id, candidateId, assessmentId",
    });
  }

  // Job operations
  async createJob(job: Job): Promise<JobDB> {
    const jobDB: JobDB = {
      ...job,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
    };
    await this.jobs.add(jobDB);
    return jobDB;
  }

  async updateJob(
    id: string,
    updates: Partial<Job>,
  ): Promise<JobDB | undefined> {
    const updatedJob = {
      ...updates,
      updatedAt: new Date().toISOString(),
      ...(updates.createdAt && { createdAt: updates.createdAt.toISOString() }),
    };
    await this.jobs.update(id, updatedJob);
    return this.jobs.get(id);
  }

  async getJobs(): Promise<JobDB[]> {
    return this.jobs.orderBy("order").toArray();
  }

  async getJobById(id: string): Promise<JobDB | undefined> {
    return this.jobs.get(id);
  }

  // Candidate operations
  async createCandidate(candidate: Candidate): Promise<CandidateDB> {
    const candidateDB: CandidateDB = {
      ...candidate,
      appliedAt: candidate.appliedAt.toISOString(),
      updatedAt: candidate.updatedAt.toISOString(),
      notes: candidate.notes?.map((note) => ({
        ...note,
        createdAt: note.createdAt.toISOString(),
      })),
    };
    await this.candidates.add(candidateDB);

    // Add timeline entry
    await this.candidateTimeline.add({
      id: `${candidate.id}-${Date.now()}`,
      candidateId: candidate.id,
      stage: candidate.stage,
      timestamp: new Date().toISOString(),
    });

    return candidateDB;
  }

  async updateCandidate(
    id: string,
    updates: Partial<Candidate>,
  ): Promise<CandidateDB | undefined> {
    const current = await this.candidates.get(id);
    if (!current) return undefined;

    const updatedCandidate = {
      ...updates,
      updatedAt: new Date().toISOString(),
      ...(updates.appliedAt && { appliedAt: updates.appliedAt.toISOString() }),
      ...(updates.notes && {
        notes: updates.notes.map((note) => ({
          ...note,
          createdAt: note.createdAt.toISOString(),
        })),
      }),
    };

    await this.candidates.update(id, updatedCandidate);

    // Add timeline entry if stage changed
    if (updates.stage && updates.stage !== current.stage) {
      await this.candidateTimeline.add({
        id: `${id}-${Date.now()}`,
        candidateId: id,
        stage: updates.stage,
        timestamp: new Date().toISOString(),
      });
    }

    return this.candidates.get(id);
  }

  async getCandidates(): Promise<CandidateDB[]> {
    return this.candidates.toArray();
  }

  async getCandidateById(id: string): Promise<CandidateDB | undefined> {
    return this.candidates.get(id);
  }

  async getCandidateTimeline(
    candidateId: string,
  ): Promise<CandidateTimelineEntry[]> {
    return this.candidateTimeline
      .where("candidateId")
      .equals(candidateId)
      .sortBy("timestamp");
  }

  // Assessment operations
  async createAssessment(assessment: Assessment): Promise<AssessmentDB> {
    const assessmentDB: AssessmentDB = {
      ...assessment,
      createdAt: assessment.createdAt.toISOString(),
      updatedAt: assessment.updatedAt.toISOString(),
    };
    await this.assessments.add(assessmentDB);
    return assessmentDB;
  }

  async updateAssessment(
    id: string,
    updates: Partial<Assessment>,
  ): Promise<AssessmentDB | undefined> {
    const updatedAssessment = {
      ...updates,
      updatedAt: new Date().toISOString(),
      ...(updates.createdAt && { createdAt: updates.createdAt.toISOString() }),
    };
    await this.assessments.update(id, updatedAssessment);
    return this.assessments.get(id);
  }

  async getAssessmentByJobId(jobId: string): Promise<AssessmentDB | undefined> {
    return this.assessments.where("jobId").equals(jobId).first();
  }

  async saveAssessmentResponse(response: AssessmentResponse): Promise<void> {
    await this.assessmentResponses.put(response);
  }

  async getAssessmentResponse(
    candidateId: string,
    assessmentId: string,
  ): Promise<AssessmentResponse | undefined> {
    return this.assessmentResponses
      .where("[candidateId+assessmentId]")
      .equals([candidateId, assessmentId])
      .first();
  }

  // Utility methods
  async clearAll(): Promise<void> {
    await Promise.all([
      this.jobs.clear(),
      this.candidates.clear(),
      this.assessments.clear(),
      this.candidateTimeline.clear(),
      this.assessmentResponses.clear(),
    ]);
  }

  async seedData(): Promise<void> {
    const jobsCount = await this.jobs.count();
    if (jobsCount > 0) return;
  }
}

export const db = new TalentFlowDB();
