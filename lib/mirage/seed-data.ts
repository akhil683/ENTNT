import { faker } from "@faker-js/faker";
import { db } from "./db";
import {
  Job,
  Candidate,
  Assessment,
  CandidateStage,
  QuestionType,
} from "../types";

const JOB_TITLES = [
  "Senior Frontend Developer",
  "Backend Engineer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Software Architect",
  "Technical Lead",
  "iOS Developer",
  "Android Developer",
  "QA Engineer",
  "Security Engineer",
  "Site Reliability Engineer",
  "Business Analyst",
  "Scrum Master",
  "Technical Writer",
  "Sales Engineer",
  "Customer Success Manager",
  "Marketing Manager",
  "HR Manager",
  "Finance Manager",
  "Operations Manager",
  "Growth Hacker",
];

const TECH_TAGS = [
  "React",
  "Angular",
  "Vue",
  "Node.js",
  "Python",
  "Java",
  "C#",
  ".NET",
  "JavaScript",
  "TypeScript",
  "Go",
  "Rust",
  "Kotlin",
  "Swift",
  "PHP",
  "Ruby",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "GraphQL",
  "REST API",
  "Microservices",
  "Machine Learning",
  "AI",
  "Data Science",
  "DevOps",
  "CI/CD",
  "Testing",
];

const CANDIDATE_STAGES: CandidateStage[] = [
  "applied",
  "screen",
  "tech",
  "offer",
  "hired",
  "rejected",
];

const QUESTION_TYPES: QuestionType[] = [
  "single-choice",
  "multi-choice",
  "short-text",
  "long-text",
  "numeric",
  "file-upload",
];

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function generateJobs(count: number = 25): Job[] {
  const jobs: Job[] = [];
  const usedSlugs = new Set<string>();

  for (let i = 0; i < count; i++) {
    const title = faker.helpers.arrayElement(JOB_TITLES);
    let slug = createSlug(title);

    // Ensure unique slugs
    let counter = 1;
    const originalSlug = slug;
    while (usedSlugs.has(slug)) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }
    usedSlugs.add(slug);

    const job: Job = {
      id: faker.string.uuid(),
      title,
      slug,
      status: faker.helpers.arrayElement(["active", "archived"] as const),
      tags: faker.helpers.arrayElements(TECH_TAGS, { min: 2, max: 6 }),
      order: i,
      description: faker.lorem.paragraphs(2),
      requirements: Array.from(
        { length: faker.number.int({ min: 3, max: 8 }) },
        () => faker.lorem.sentence(),
      ),
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: faker.date.recent({ days: 30 }),
    };

    jobs.push(job);
  }

  return jobs;
}

function generateCandidates(jobs: Job[], count: number = 1000): Candidate[] {
  const candidates: Candidate[] = [];

  for (let i = 0; i < count; i++) {
    const job = faker.helpers.arrayElement(jobs);
    const appliedAt = faker.date.past({ years: 1 });

    const candidate: Candidate = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      stage: faker.helpers.arrayElement(CANDIDATE_STAGES),
      jobId: job.id,
      appliedAt,
      updatedAt: faker.date.between({ from: appliedAt, to: new Date() }),
      notes: faker.datatype.boolean(0.3)
        ? [
            {
              id: faker.string.uuid(),
              content: faker.lorem.paragraph(),
              createdAt: faker.date.recent({ days: 7 }),
              author: faker.person.fullName(),
            },
            ...(faker.datatype.boolean(0.5)
              ? [
                  {
                    id: faker.string.uuid(),
                    content: `Follow up with @${faker.person.firstName()} about technical assessment`,
                    createdAt: faker.date.recent({ days: 3 }),
                    author: faker.person.fullName(),
                  },
                ]
              : []),
          ]
        : undefined,
    };

    candidates.push(candidate);
  }

  return candidates;
}

function generateAssessments(jobs: Job[]): Assessment[] {
  const assessments: Assessment[] = [];
  const activeJobs = jobs.filter((job) => job.status === "active");

  // Create assessments for at least 3 jobs, but try to cover more
  const jobsToAssess = faker.helpers.arrayElements(activeJobs, {
    min: Math.min(3, activeJobs.length),
    max: Math.min(8, activeJobs.length),
  });

  jobsToAssess.forEach((job) => {
    const assessment: Assessment = {
      id: faker.string.uuid(),
      jobId: job.id,
      title: `${job.title} Assessment`,
      description: `Complete this assessment to demonstrate your skills for the ${job.title} position.`,
      sections: generateAssessmentSections(job),
      createdAt: job.createdAt,
      updatedAt: faker.date.recent({ days: 7 }),
    };

    assessments.push(assessment);
  });

  return assessments;
}

function generateAssessmentSections(job: Job) {
  const sections = [
    {
      id: faker.string.uuid(),
      title: "General Information",
      description: "Tell us about yourself",
      questions: [
        {
          id: faker.string.uuid(),
          type: "short-text" as const,
          title: "What is your full name?",
          required: true,
          validation: { maxLength: 100 },
        },
        {
          id: faker.string.uuid(),
          type: "single-choice" as const,
          title: "How many years of experience do you have?",
          required: true,
          options: [
            "0-1 years",
            "2-3 years",
            "4-6 years",
            "7-10 years",
            "10+ years",
          ],
        },
        {
          id: faker.string.uuid(),
          type: "long-text" as const,
          title: "Why are you interested in this position?",
          description: "Please provide a detailed explanation",
          required: true,
          validation: { minLength: 50, maxLength: 500 },
        },
      ],
    },
  ];

  // Technical section based on job tags
  const techQuestions = [];

  if (job.tags.includes("React") || job.tags.includes("JavaScript")) {
    const questionId = faker.string.uuid();
    techQuestions.push({
      id: questionId,
      type: "single-choice" as const,
      title: "Have you worked with React before?",
      required: true,
      options: ["Yes", "No"],
    });

    techQuestions.push({
      id: faker.string.uuid(),
      type: "multi-choice" as const,
      title: "Which React concepts are you familiar with?",
      description: "Select all that apply",
      required: false,
      options: [
        "Hooks",
        "Context API",
        "Redux",
        "Next.js",
        "Testing Library",
        "TypeScript",
      ],
      conditionalLogic: {
        dependsOn: questionId,
        showWhen: "Yes",
      },
    });
  }

  techQuestions.push({
    id: faker.string.uuid(),
    type: "numeric" as const,
    title: "Rate your overall technical skills (1-10)",
    required: true,
    validation: { min: 1, max: 10 },
  });

  techQuestions.push({
    id: faker.string.uuid(),
    type: "long-text" as const,
    title: "Describe a challenging technical problem you solved recently",
    required: false,
    validation: { maxLength: 1000 },
  });

  techQuestions.push({
    id: faker.string.uuid(),
    type: "file-upload" as const,
    title: "Upload your resume/CV",
    description: "Please upload a PDF or DOC file",
    required: true,
  });

  sections.push({
    id: faker.string.uuid(),
    title: "Technical Assessment",
    description: `Technical questions specific to ${job.title}`,
    questions: techQuestions,
  });

  // Additional questions to reach 10+ total
  const additionalQuestions = [];
  const remainingCount = Math.max(
    0,
    10 - sections.reduce((sum, s) => sum + s.questions.length, 0),
  );

  for (let i = 0; i < remainingCount; i++) {
    additionalQuestions.push({
      id: faker.string.uuid(),
      type: faker.helpers.arrayElement(QUESTION_TYPES),
      title: faker.lorem.sentence().slice(0, -1) + "?",
      description: faker.datatype.boolean(0.4)
        ? faker.lorem.sentence()
        : undefined,
      required: faker.datatype.boolean(0.6),
      options: ["single-choice", "multi-choice"].includes(
        faker.helpers.arrayElement(QUESTION_TYPES),
      )
        ? faker.helpers.arrayElements(
            ["Option A", "Option B", "Option C", "Option D"],
            { min: 2, max: 4 },
          )
        : undefined,
      validation: faker.datatype.boolean(0.3)
        ? {
            minLength: faker.number.int({ min: 10, max: 50 }),
            maxLength: faker.number.int({ min: 100, max: 500 }),
            min: faker.number.int({ min: 1, max: 5 }),
            max: faker.number.int({ min: 5, max: 100 }),
          }
        : undefined,
    });
  }

  if (additionalQuestions.length > 0) {
    sections.push({
      id: faker.string.uuid(),
      title: "Additional Questions",
      questions: additionalQuestions,
    });
  }

  return sections;
}

export async function seedDatabase(): Promise<void> {
  try {
    // Check if already seeded
    const existingJobs = await db.jobs.count();
    if (existingJobs > 0) {
      console.log("Database already seeded");
      return;
    }

    console.log("Seeding database...");

    // Generate and insert jobs
    const jobs = generateJobs(25);
    for (const job of jobs) {
      await db.createJob(job);
    }
    console.log(`✅ Created ${jobs.length} jobs`);

    // Generate and insert candidates
    const candidates = generateCandidates(jobs, 1000);
    for (const candidate of candidates) {
      await db.createCandidate(candidate);
    }
    console.log(`✅ Created ${candidates.length} candidates`);

    // Generate and insert assessments
    const assessments = generateAssessments(jobs);
    for (const assessment of assessments) {
      await db.createAssessment(assessment);
    }
    console.log(`✅ Created ${assessments.length} assessments`);

    console.log("🎉 Database seeding completed!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}
