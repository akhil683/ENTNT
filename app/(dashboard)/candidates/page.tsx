"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { CandidatesList } from "@/components/candidates/candidates-list";
import { CandidatesFilters } from "@/components/candidates/candidates-filters";
import { CandidatesKanban } from "@/components/candidates/candidates-kanban";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Kanban } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { mockApi } from "@/lib/mock-api";
import type { Candidate } from "@/lib/types";

export default function CandidatesPage() {
  const searchParams = useSearchParams();
  const jobFilter = searchParams.get("job");

  const [view, setView] = useState<"list" | "kanban">("list");
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    search: "",
    stage: "",
    jobId: jobFilter || "",
  });

  const { jobs } = useAppStore();

  // Load all candidates on mount
  useEffect(() => {
    const loadAllCandidates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all candidates in batches
        const allCandidatesData: Candidate[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await mockApi.getCandidates({
            page,
            pageSize: 100, // Load in larger batches
          });

          allCandidatesData.push(...response.data);
          hasMore = page < response.pagination.totalPages;
          page++;
        }

        setAllCandidates(allCandidatesData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load candidates",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAllCandidates();
  }, []);

  // Client-side filtering
  const filteredData = useMemo(() => {
    let filtered = [...allCandidates];

    // Search filter (client-side)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchLower) ||
          candidate.email.toLowerCase().includes(searchLower),
      );
    }

    // Stage filter
    if (filters.stage) {
      filtered = filtered.filter(
        (candidate) => candidate.stage === filters.stage,
      );
    }

    // Job filter
    if (filters.jobId) {
      filtered = filtered.filter(
        (candidate) => candidate.jobId === filters.jobId,
      );
    }

    return filtered;
  }, [allCandidates, filters]);

  useEffect(() => {
    setFilteredCandidates(filteredData);
  }, [filteredData]);

  const handleCandidateUpdated = (updatedCandidate: Candidate) => {
    setAllCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === updatedCandidate.id ? updatedCandidate : candidate,
      ),
    );
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Candidates
            </h1>
            <p className="text-muted-foreground">
              Manage candidates and track their progress through the hiring
              pipeline
            </p>
          </div>

          <Tabs
            value={view}
            onValueChange={(value) => setView(value as "list" | "kanban")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <Kanban className="h-4 w-4" />
                Kanban Board
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-6">
          <CandidatesFilters
            filters={filters}
            onFiltersChange={setFilters}
            loading={loading}
            jobs={jobs}
            totalCount={filteredCandidates.length}
          />

          <Tabs value={view} className="w-full">
            <TabsContent value="list" className="mt-0">
              <CandidatesList
                candidates={filteredCandidates}
                loading={loading}
                error={error}
                onCandidateUpdated={handleCandidateUpdated}
              />
            </TabsContent>

            <TabsContent value="kanban" className="mt-0">
              <CandidatesKanban
                candidates={filteredCandidates}
                loading={loading}
                error={error}
                onCandidateUpdated={handleCandidateUpdated}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
