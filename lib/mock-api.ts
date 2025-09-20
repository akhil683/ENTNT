import type { Job, Candidate, Assessment, CandidateStage } from "./types";
import { talentFlowDB } from "./db";

// Mock data generators
const generateMockJobs = (): Job[] => {
  const jobs: Job[] = [];
  const titles = [
    "Senior Frontend Developer",
    "Backend Engineer",
    "Full Stack Developer",
    "DevOps Engineer",
    "Product Manager",
    "UX Designer",
    "Data Scientist",
    "Mobile Developer",
    "QA Engineer",
    "Technical Writer",
    "Sales Manager",
    "Marketing Specialist",
    "Customer Success Manager",
    "HR Business Partner",
    "Financial Analyst",
    "Operations Manager",
    "Security Engineer",
    "Cloud Architect",
    "Machine Learning Engineer",
    "Business Analyst",
    "Project Manager",
    "Scrum Master",
    "Content Creator",
    "Social Media Manager",
    "Growth Hacker",
  ];

  const tags = [
    "Remote",
    "Full-time",
    "Part-time",
    "Contract",
    "Senior",
    "Junior",
    "Mid-level",
    "Urgent",
    "New",
  ];

  for (let i = 0; i < 25; i++) {
    const title = titles[i];
    const slug = title.toLowerCase().replace(/\s+/g, "-");
    const status = Math.random() > 0.3 ? "active" : "archived";
    const jobTags = tags.filter(() => Math.random() > 0.7).slice(0, 3);

    jobs.push({
      id: `job-${i + 1}`,
      title,
      slug,
      status: status as "active" | "archived",
      tags: jobTags,
      order: i,
      description: `We are looking for a talented ${title} to join our growing team. This is an excellent opportunity to work with cutting-edge technologies and make a significant impact.`,
      requirements: [
        `3+ years of experience in ${title.toLowerCase()}`,
        "Strong problem-solving skills",
        "Excellent communication abilities",
        "Team player with leadership potential",
      ],
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    });
  }

  return jobs;
};

const generateMockCandidates = (jobs: Job[]): Candidate[] => {
  const candidates: Candidate[] = [];
  const firstNames = [
    "John",
    "Jane",
    "Michael",
    "Sarah",
    "David",
    "Emily",
    "Chris",
    "Lisa",
    "Robert",
    "Amanda",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
  ];
  const stages: CandidateStage[] = [
    "applied",
    "screen",
    "tech",
    "offer",
    "hired",
    "rejected",
  ];

  for (let i = 0; i < 1000; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    const jobId = jobs[Math.floor(Math.random() * jobs.length)].id;
    const stage = stages[Math.floor(Math.random() * stages.length)];

    candidates.push({
      id: `candidate-${i + 1}`,
      name,
      email,
      stage,
      jobId,
      appliedAt: new Date(
        Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
      ),
      updatedAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ),
      notes:
        Math.random() > 0.7
          ? [
              {
                id: `note-${i}`,
                content: `Great candidate with strong technical skills. @john.doe mentioned they would be a good fit for the team.`,
                createdAt: new Date(
                  Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
                ),
                author: "HR Team",
              },
            ]
          : undefined,
    });
  }

  return candidates;
};

const generateMockAssessments = (jobs: Job[]): Assessment[] => {
  const assessments: Assessment[] = [];

  // Create assessments for first 3 jobs
  for (let i = 0; i < 3; i++) {
    const job = jobs[i];
    if (!job) continue;

    assessments.push({
      id: `assessment-${i + 1}`,
      jobId: job.id,
      title: `${job.title} Assessment`,
      description: `Technical and behavioral assessment for ${job.title} position`,
      sections: [
        {
          id: `section-${i}-1`,
          title: "Technical Skills",
          description: "Evaluate technical competencies",
          questions: [
            {
              id: `q-${i}-1`,
              type: "single-choice",
              text: "How many years of experience do you have?",
              validation: { required: true },
              options: ["0-1 years", "2-3 years", "4-5 years", "6+ years"],
            },
            {
              id: `q-${i}-2`,
              type: "multi-choice",
              text: "Which technologies are you proficient in?",
              validation: { required: true },
              options: [
                "JavaScript",
                "TypeScript",
                "React",
                "Node.js",
                "Python",
                "Java",
              ],
            },
            {
              id: `q-${i}-3`,
              type: "long-text",
              text: "Describe a challenging project you worked on",
              validation: { required: true, minLength: 100, maxLength: 1000 },
              conditional: {
                dependsOn: `q-${i}-1`,
                showWhen: "2-3 years",
              },
            },
          ],
        },
        {
          id: `section-${i}-2`,
          title: "Behavioral Questions",
          description: "Assess cultural fit and soft skills",
          questions: [
            {
              id: `q-${i}-4`,
              type: "short-text",
              text: "Why are you interested in this position?",
              validation: { required: true, maxLength: 500 },
            },
            {
              id: `q-${i}-5`,
              type: "numeric",
              text: "Rate your communication skills (1-10)",
              validation: { required: true, min: 1, max: 10 },
            },
            {
              id: `q-${i}-6`,
              type: "file-upload",
              text: "Upload your portfolio or relevant work samples",
              validation: { required: false },
            },
          ],
        },
      ],
      createdAt: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    });
  }

  return assessments;
};

// Initialize mock data with IndexedDB
let mockJobs: Job[] = [];
let mockCandidates: Candidate[] = [];
let mockAssessments: Assessment[] = [];

// Initialize data on first load
const initializeData = async () => {
  if (typeof window === "undefined") return;

  try {
    const isInitialized = await talentFlowDB.isInitialized();

    if (!isInitialized) {
      // Generate and store initial data
      mockJobs = generateMockJobs();
      mockCandidates = generateMockCandidates(mockJobs);
      mockAssessments = generateMockAssessments(mockJobs);

      await talentFlowDB.putMany("jobs", mockJobs);
      await talentFlowDB.putMany("candidates", mockCandidates);
      await talentFlowDB.putMany("assessments", mockAssessments);
      await talentFlowDB.markInitialized();
    } else {
      // Load existing data
      mockJobs = await talentFlowDB.get<Job>("jobs");
      mockCandidates = await talentFlowDB.get<Candidate>("candidates");
      mockAssessments = await talentFlowDB.get<Assessment>("assessments");
    }
  } catch (error) {
    console.error(
      "Failed to initialize IndexedDB, falling back to localStorage:",
      error,
    );
    // Fallback to localStorage if IndexedDB fails
    const stored = localStorage.getItem("talentflow-mock-data");
    if (stored) {
      const data = JSON.parse(stored);
      mockJobs = data.jobs || [];
      mockCandidates = data.candidates || [];
      mockAssessments = data.assessments || [];
    } else {
      mockJobs = generateMockJobs();
      mockCandidates = generateMockCandidates(mockJobs);
      mockAssessments = generateMockAssessments(mockJobs);
      localStorage.setItem(
        "talentflow-mock-data",
        JSON.stringify({
          jobs: mockJobs,
          candidates: mockCandidates,
          assessments: mockAssessments,
        }),
      );
    }
  }
};

// Initialize on module load
if (typeof window !== "undefined") {
  initializeData();
}

// Utility functions
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const shouldError = () => Math.random() < 0.08; // 8% error rate
const getRandomDelay = () => Math.random() * 1000 + 200; // 200-1200ms

const persistData = async () => {
  try {
    await talentFlowDB.putMany("jobs", mockJobs);
    await talentFlowDB.putMany("candidates", mockCandidates);
    await talentFlowDB.putMany("assessments", mockAssessments);
  } catch (error) {
    console.error(
      "Failed to persist to IndexedDB, falling back to localStorage:",
      error,
    );
    localStorage.setItem(
      "talentflow-mock-data",
      JSON.stringify({
        jobs: mockJobs,
        candidates: mockCandidates,
        assessments: mockAssessments,
      }),
    );
  }
};

// Mock API functions
export const mockApi = {
  // Jobs API
  async getJobs(params: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
    sort?: string;
  }) {
    // await delay(getRandomDelay());

    if (shouldError()) {
      throw new Error("Failed to fetch jobs");
    }

    let filteredJobs = [...mockJobs];

    // Apply filters
    if (params.search) {
      filteredJobs = filteredJobs.filter((job) =>
        job.title.toLowerCase().includes(params.search!.toLowerCase()),
      );
    }

    if (params.status) {
      filteredJobs = filteredJobs.filter((job) => job.status === params.status);
    }

    // Apply sorting
    if (params.sort) {
      const [field, direction] = params.sort.split(":");
      filteredJobs.sort((a, b) => {
        const aVal = a[field as keyof Job] || 0;
        const bVal = b[field as keyof Job] || 0;
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return direction === "desc" ? -comparison : comparison;
      });
    }

    // Apply pagination
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedJobs = filteredJobs.slice(start, end);

    return {
      data: paginatedJobs,
      pagination: {
        page,
        pageSize,
        total: filteredJobs.length,
        totalPages: Math.ceil(filteredJobs.length / pageSize),
      },
    };
  },

  async createJob(job: Omit<Job, "id" | "createdAt" | "updatedAt">) {
    await delay(getRandomDelay());

    if (shouldError()) {
      throw new Error("Failed to create job");
    }

    const newJob: Job = {
      ...job,
      id: `job-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockJobs.push(newJob);
    await persistData();

    return newJob;
  },

  async updateJob(id: string, updates: Partial<Job>) {
    await delay(getRandomDelay());

    if (shouldError()) {
      throw new Error("Failed to update job");
    }

    const index = mockJobs.findIndex((job) => job.id === id);
    if (index === -1) {
      throw new Error("Job not found");
    }

    mockJobs[index] = { ...mockJobs[index], ...updates, updatedAt: new Date() };
    await persistData();

    return mockJobs[index];
  },

  async reorderJobs(updatedJobs: { id: string; order: number }[]) {
    // await delay(getRandomDelay());

    // Simulate occasional failures for rollback testing
    // if (Math.random() < 0.1) {
    //   throw new Error("Reorder operation failed");
    // }
    updatedJobs.forEach(({ id, order }) => {
      const job = mockJobs.find((j) => j.id === id);
      if (job) {
        job.order = order;
      }
    });
    console.log("reorder", mockJobs);
    await persistData();

    return { success: true };
  },

  // Candidates API
  async getCandidates(params: {
    search?: string;
    stage?: string;
    page?: number;
    pageSize?: number;
  }) {
    await delay(getRandomDelay());

    if (shouldError()) {
      throw new Error("Failed to fetch candidates");
    }

    let filteredCandidates = [...mockCandidates];

    if (params.search) {
      filteredCandidates = filteredCandidates.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          candidate.email.toLowerCase().includes(params.search!.toLowerCase()),
      );
    }

    if (params.stage) {
      filteredCandidates = filteredCandidates.filter(
        (candidate) => candidate.stage === params.stage,
      );
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 50;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedCandidates = filteredCandidates.slice(start, end);

    return {
      data: paginatedCandidates,
      pagination: {
        page,
        pageSize,
        total: filteredCandidates.length,
        totalPages: Math.ceil(filteredCandidates.length / pageSize),
      },
    };
  },

  async updateCandidate(id: string, updates: Partial<Candidate>) {
    await delay(getRandomDelay());

    if (shouldError()) {
      throw new Error("Failed to update candidate");
    }

    const index = mockCandidates.findIndex((candidate) => candidate.id === id);
    if (index === -1) {
      throw new Error("Candidate not found");
    }

    mockCandidates[index] = {
      ...mockCandidates[index],
      ...updates,
      updatedAt: new Date(),
    };
    await persistData();

    return mockCandidates[index];
  },

  async getCandidateTimeline(id: string) {
    await delay(getRandomDelay());

    const candidate = mockCandidates.find((c) => c.id === id);
    if (!candidate) {
      throw new Error("Candidate not found");
    }

    // Generate mock timeline
    const timeline = [
      {
        id: "1",
        event: "Application Submitted",
        stage: "applied",
        date: candidate.appliedAt,
        description: "Candidate submitted application",
      },
      {
        id: "2",
        event: "Moved to Screening",
        stage: "screen",
        date: new Date(candidate.appliedAt.getTime() + 2 * 24 * 60 * 60 * 1000),
        description: "Application reviewed and moved to screening",
      },
    ];

    return timeline;
  },

  // Assessments API
  async getAssessment(jobId: string) {
    await delay(getRandomDelay());

    const assessment = mockAssessments.find((a) => a.jobId === jobId);
    return assessment || null;
  },

  async saveAssessment(assessment: Assessment) {
    await delay(getRandomDelay());

    if (shouldError()) {
      throw new Error("Failed to save assessment");
    }

    const index = mockAssessments.findIndex((a) => a.id === assessment.id);
    if (index >= 0) {
      mockAssessments[index] = { ...assessment, updatedAt: new Date() };
    } else {
      mockAssessments.push(assessment);
    }

    await persistData();

    return assessment;
  },

  async submitAssessmentResponse(
    jobId: string,
    responses: Record<string, any>,
  ) {
    await delay(getRandomDelay());

    // Store in IndexedDB
    try {
      await talentFlowDB.put("assessmentResponses", {
        jobId,
        responses,
        submittedAt: new Date(),
      });
    } catch (error) {
      // Fallback to localStorage
      const key = `assessment-response-${jobId}`;
      localStorage.setItem(
        key,
        JSON.stringify({
          responses,
          submittedAt: new Date(),
        }),
      );
    }

    return { success: true };
  },
};
