import { createServer, Model, Response } from 'miragejs';
import { db, JobDB, CandidateDB, AssessmentDB } from './db';
import { seedDatabase } from './seed-data';

function withLatency<T>(data: T, errorRate: number = 0.05): Promise<T> {
  return new Promise((resolve, reject) => {
    const latency = Math.random() * 1000 + 200; // 200-1200ms

    setTimeout(() => {
      if (Math.random() < errorRate) {
        reject(new Response(500, {}, { error: 'Internal server error' }));
      } else {
        resolve(data);
      }
    }, latency);
  });
}

// Helper function to simulate write operation failures
function withWriteFailure<T>(data: T, failureRate: number = 0.08): Promise<T> {
  return new Promise((resolve, reject) => {
    const latency = Math.random() * 800 + 200;

    setTimeout(() => {
      if (Math.random() < failureRate) {
        reject(new Response(500, {}, { error: 'Write operation failed' }));
      } else {
        resolve(data);
      }
    }, latency);
  });
}

// Convert DB entities to API format
function dbJobToApi(job: JobDB) {
  return {
    ...job,
    createdAt: new Date(job.createdAt),
    updatedAt: new Date(job.updatedAt),
  };
}

function dbCandidateToApi(candidate: CandidateDB) {
  return {
    ...candidate,
    appliedAt: new Date(candidate.appliedAt),
    updatedAt: new Date(candidate.updatedAt),
    notes: candidate.notes?.map(note => ({
      ...note,
      createdAt: new Date(note.createdAt),
    })),
  };
}

function dbAssessmentToApi(assessment: AssessmentDB) {
  return {
    ...assessment,
    createdAt: new Date(assessment.createdAt),
    updatedAt: new Date(assessment.updatedAt),
  };
}

export function makeServer({ environment = 'development' } = {}) {
  const server = createServer({
    environment,

    models: {
      job: Model,
      candidate: Model,
      assessment: Model,
    },

    seeds() {
      // Seed the IndexedDB on server startup
      seedDatabase().catch(console.error);
    },

    routes() {
      this.namespace = 'api';

      // JOBS ENDPOINTS
      this.get('/jobs', async (schema, request) => {
        try {
          const { search = '', status = '', page = '1', pageSize = '10', sort = 'order' } = request.queryParams;

          let jobs = await db.getJobs();

          // Apply filters
          if (search) {
            const searchLower = search.toLowerCase();
            jobs = jobs.filter(job => 
              job.title.toLowerCase().includes(searchLower) ||
              job.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
          }

          if (status) {
            jobs = jobs.filter(job => job.status === status);
          }

          // Apply sorting
          if (sort === 'title') {
            jobs.sort((a, b) => a.title.localeCompare(b.title));
          } else if (sort === 'createdAt') {
            jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          } else {
            jobs.sort((a, b) => a.order - b.order);
          }

          // Apply pagination
          const pageNum = parseInt(page);
          const size = parseInt(pageSize);
          const total = jobs.length;
          const totalPages = Math.ceil(total / size);
          const start = (pageNum - 1) * size;
          const paginatedJobs = jobs.slice(start, start + size);

          const response = {
            data: paginatedJobs.map(dbJobToApi),
            pagination: {
              page: pageNum,
              pageSize: size,
              total,
              totalPages,
            },
          };

          return withLatency(response);
        } catch (error) {
          return new Response(500, {}, { error: 'Failed to fetch candidate timeline' });
        }
      });

      this.post('/candidates', async (schema, request) => {
        try {
          const attrs = JSON.parse(request.requestBody);
          const candidate = {
            id: attrs.id || crypto.randomUUID(),
            name: attrs.name,
            email: attrs.email,
            stage: attrs.stage || 'applied',
            jobId: attrs.jobId,
            appliedAt: new Date(),
            updatedAt: new Date(),
            notes: attrs.notes,
          };

          const createdCandidate = await db.createCandidate(candidate);
          return withWriteFailure(dbCandidateToApi(createdCandidate));
        } catch (error) {
          return new Response(400, {}, { error: 'Failed to create candidate' });
        }
      });

      this.patch('/candidates/:id', async (schema, request) => {
        try {
          const attrs = JSON.parse(request.requestBody);
          const updatedCandidate = await db.updateCandidate(request.params.id, {
            ...attrs,
            updatedAt: new Date(),
          });

          if (!updatedCandidate) {
            return new Response(404, {}, { error: 'Candidate not found' });
          }

          return withWriteFailure(dbCandidateToApi(updatedCandidate));
        } catch (error) {
          return new Response(400, {}, { error: 'Failed to update candidate' });
        }
      });

      // ASSESSMENTS ENDPOINTS
      this.get('/assessments/:jobId', async (schema, request) => {
        try {
          const assessment = await db.getAssessmentByJobId(request.params.jobId);
          if (!assessment) {
            return new Response(404, {}, { error: 'Assessment not found' });
          }
          return withLatency(dbAssessmentToApi(assessment));
        } catch (error) {
          return new Response(500, {}, { error: 'Failed to fetch assessment' });
        }
      });

      this.put('/assessments/:jobId', async (schema, request) => {
        try {
          const attrs = JSON.parse(request.requestBody);

          // Check if assessment exists
          const existing = await db.getAssessmentByJobId(request.params.jobId);

          if (existing) {
            // Update existing assessment
            const updatedAssessment = await db.updateAssessment(existing.id, {
              ...attrs,
              updatedAt: new Date(),
            });
            return withWriteFailure(dbAssessmentToApi(updatedAssessment!));
          } else {
            // Create new assessment
            const assessment = {
              id: attrs.id || crypto.randomUUID(),
              jobId: request.params.jobId,
              title: attrs.title,
              description: attrs.description,
              sections: attrs.sections,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            const createdAssessment = await db.createAssessment(assessment);
            return withWriteFailure(dbAssessmentToApi(createdAssessment));
          }
        } catch (error) {
          return new Response(400, {}, { error: 'Failed to save assessment' });
        }
      });

      this.post('/assessments/:jobId/submit', async (schema, request) => {
        try {
          const attrs = JSON.parse(request.requestBody);
          const response = {
            id: crypto.randomUUID(),
            candidateId: attrs.candidateId,
            assessmentId: request.params.jobId,
            responses: attrs.responses,
            submittedAt: new Date().toISOString(),
          };

          await db.saveAssessmentResponse(response);
          return withWriteFailure({ success: true, id: response.id });
        } catch (error) {
          return new Response(400, {}, { error: 'Failed to submit assessment' });
        }
      });

      this.get('/assessments/:jobId/responses/:candidateId', async (schema, request) => {
        try {
          const response = await db.getAssessmentResponse(
            request.params.candidateId,
            request.params.jobId
          );

          if (!response) {
            return new Response(404, {}, { error: 'Assessment response not found' });
          }

          return withLatency(response);
        } catch (error) {
          return new Response(500, {}, { error: 'Failed to fetch assessment response' });
        }
      });

      // Handle preflight requests
      this.options('/*', () => new Response(200));
    },
  });

  return server;
}) {
          return new Response(500, {}, { error: 'Failed to fetch jobs' });
        }
      });

      this.get('/jobs/:id', async (schema, request) => {
        try {
          const job = await db.getJobById(request.params.id);
          if (!job) {
            return new Response(404, {}, { error: 'Job not found' });
          }
          return withLatency(dbJobToApi(job));
        } catch (error) {
          return new Response(500, {}, { error: 'Failed to fetch job' });
        }
      });

      this.post('/jobs', async (schema, request) => {
        try {
          const attrs = JSON.parse(request.requestBody);
          const job = {
            id: attrs.id || crypto.randomUUID(),
            title: attrs.title,
            slug: attrs.slug,
            status: attrs.status || 'active',
            tags: attrs.tags || [],
            order: attrs.order ?? 0,
            description: attrs.description,
            requirements: attrs.requirements,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const createdJob = await db.createJob(job);
          return withWriteFailure(dbJobToApi(createdJob));
        } catch (error) {
          return new Response(400, {}, { error: 'Failed to create job' });
        }
      });

      this.patch('/jobs/:id', async (schema, request) => {
        try {
          const attrs = JSON.parse(request.requestBody);
          const updatedJob = await db.updateJob(request.params.id, {
            ...attrs,
            updatedAt: new Date(),
          });

          if (!updatedJob) {
            return new Response(404, {}, { error: 'Job not found' });
          }

          return withWriteFailure(dbJobToApi(updatedJob));
        } catch (error) {
          return new Response(400, {}, { error: 'Failed to update job' });
        }
      });

      this.patch('/jobs/:id/reorder', async (schema, request) => {
        try {
          const { fromOrder, toOrder } = JSON.parse(request.requestBody);

          // Simulate occasional failure for reorder operations
          if (Math.random() < 0.1) { // 10% failure rate for reorder
            return new Response(500, {}, { error: 'Reorder operation failed' });
          }

          const jobs = await db.getJobs();
          const job = jobs.find(j => j.order === fromOrder);

          if (!job) {
            return new Response(404, {}, { error: 'Job not found' });
          }

          // Update job order
          await db.updateJob(job.id, { order: toOrder });

          // Adjust other jobs' orders
          if (fromOrder < toOrder) {
            // Moving down: shift others up
            for (const otherJob of jobs) {
              if (otherJob.id !== job.id && otherJob.order > fromOrder && otherJob.order <= toOrder) {
                await db.updateJob(otherJob.id, { order: otherJob.order - 1 });
              }
            }
          } else {
            // Moving up: shift others down
            for (const otherJob of jobs) {
              if (otherJob.id !== job.id && otherJob.order >= toOrder && otherJob.order < fromOrder) {
                await db.updateJob(otherJob.id, { order: otherJob.order + 1 });
              }
            }
          }

          return withLatency({ success: true });
        } catch (error) {
          return new Response(500, {}, { error: 'Reorder operation failed' });
        }
      });

      // CANDIDATES ENDPOINTS
      this.get('/candidates', async (schema, request) => {
        try {
          const { search = '', stage = '', page = '1', pageSize = '50' } = request.queryParams;

          let candidates = await db.getCandidates();

          // Apply filters
          if (search) {
            const searchLower = search.toLowerCase();
            candidates = candidates.filter(candidate => 
              candidate.name.toLowerCase().includes(searchLower) ||
              candidate.email.toLowerCase().includes(searchLower)
            );
          }

          if (stage) {
            candidates = candidates.filter(candidate => candidate.stage === stage);
          }

          // Sort by most recent first
          candidates.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

          // Apply pagination
          const pageNum = parseInt(page);
          const size = parseInt(pageSize);
          const total = candidates.length;
          const totalPages = Math.ceil(total / size);
          const start = (pageNum - 1) * size;
          const paginatedCandidates = candidates.slice(start, start + size);

          const response = {
            data: paginatedCandidates.map(dbCandidateToApi),
            pagination: {
              page: pageNum,
              pageSize: size,
              total,
              totalPages,
            },
          };

          return withLatency(response);
        } catch (error) {
          return new Response(500, {}, { error: 'Failed to fetch candidates' });
        }
      });

      this.get('/candidates/:id', async (schema, request) => {
        try {
          const candidate = await db.getCandidateById(request.params.id);
          if (!candidate) {
            return new Response(404, {}, { error: 'Candidate not found' });
          }
          return withLatency(dbCandidateToApi(candidate));
        } catch (error) {
          return new Response(500, {}, { error: 'Failed to fetch candidate' });
        }
      });

      this.get('/candidates/:id/timeline', async (schema, request) => {
        try {
          const timeline = await db.getCandidateTimeline(request.params.id);
          return withLatency(timeline);
        } catch (error) {
console.log(error)
}
})
}