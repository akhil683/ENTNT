"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CandidatesList } from "@/components/candidates/candidates-list";
import { CandidatesFilters } from "@/components/candidates/candidates-filters";
import { CandidatesKanban } from "@/components/candidates/candidates-kanban";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, Kanban, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { mockApi } from "@/lib/mock-api";
import type { Candidate } from "@/lib/types";

export default function CandidatesPage() {
  const searchParams = useSearchParams();
  const jobFilter = searchParams.get("job");

  const [view, setView] = useState<"list" | "kanban">("list");

  const [filters, setFilters] = useState({
    search: "",
    stage: "",
    jobId: jobFilter || "",
  });

  const { jobs } = useAppStore();

  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["candidates"],
    queryFn: async ({ pageParam = 1 }) =>
      mockApi.getCandidates({ page: pageParam, pageSize: 100 }),
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length < lastPage.pagination.totalPages) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Flatten candidates across pages
  const allCandidates: Candidate[] = data
    ? data.pages.flatMap((page) => page.data)
    : [];

  // Client-side filtering
  const filteredCandidates = useMemo(() => {
    let filtered = [...allCandidates];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(searchLower) ||
          candidate.email.toLowerCase().includes(searchLower),
      );
    }

    if (filters.stage) {
      filtered = filtered.filter(
        (candidate) => candidate.stage === filters.stage,
      );
    }

    if (filters.jobId) {
      filtered = filtered.filter(
        (candidate) => candidate.jobId === filters.jobId,
      );
    }

    return filtered;
  }, [allCandidates, filters]);

  const handleCandidateUpdated = (updatedCandidate: Candidate) => {
    // Optimistically update candidate in the current list
    // (if you later persist this, sync with mockApi/db)
    if (!data) return;
    data.pages.forEach((page) => {
      page.data = page.data.map((c) =>
        c.id === updatedCandidate.id ? updatedCandidate : c,
      );
    });
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
            loading={isLoading}
            jobs={jobs}
            totalCount={filteredCandidates.length}
          />

          {isLoading ? (
            <div className="w-full flex justify-center items-center">
              <Loader2 className="animate-spin mt-16" />
            </div>
          ) : error ? (
            <p className="text-red-500">Failed to load candidates</p>
          ) : (
            <Tabs value={view} className="w-full">
              <TabsContent value="list" className="mt-0">
                <CandidatesList
                  candidates={filteredCandidates}
                  loading={isLoading}
                  error={error}
                  onCandidateUpdated={handleCandidateUpdated}
                />
              </TabsContent>

              <TabsContent value="kanban" className="mt-0">
                <CandidatesKanban
                  candidates={filteredCandidates}
                  loading={isLoading}
                  error={error}
                  onCandidateUpdated={handleCandidateUpdated}
                />
              </TabsContent>
            </Tabs>
          )}

          {hasNextPage && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading more..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
