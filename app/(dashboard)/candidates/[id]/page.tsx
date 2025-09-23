"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Mail,
  Calendar,
  Briefcase,
  MessageSquare,
  Plus,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { mockApi } from "@/lib/mock-api";
import type { Candidate, CandidateStage } from "@/lib/types";

const stages = [
  {
    value: "applied",
    label: "Applied",
    color: "bg-blue-100 text-blue-800",
    icon: Clock,
  },
  {
    value: "screen",
    label: "Screening",
    color: "bg-yellow-100 text-yellow-800",
    icon: User,
  },
  {
    value: "tech",
    label: "Technical",
    color: "bg-purple-100 text-purple-800",
    icon: AlertCircle,
  },
  {
    value: "offer",
    label: "Offer",
    color: "bg-orange-100 text-orange-800",
    icon: CheckCircle,
  },
  {
    value: "hired",
    label: "Hired",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  {
    value: "rejected",
    label: "Rejected",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
];

export default function CandidateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [newNote, setNewNote] = useState("");
  const [updatingStage, setUpdatingStage] = useState(false);

  const { jobs, candidates, updateCandidate } = useAppStore();

  useEffect(() => {
    const loadCandidate = async () => {
      try {
        setLoading(true);
        const existingCandidate = candidates.find((c) => c.id === candidateId);
        if (existingCandidate) {
          setCandidate(existingCandidate);
          const timelineData = await mockApi.getCandidateTimeline(candidateId);
          setTimeline(timelineData);
        } else {
          setCandidate(null);
        }
      } catch (error) {
        console.error("Failed to load candidate:", error);
        setCandidate(null);
      } finally {
        setLoading(false);
      }
    };

    loadCandidate();
  }, [candidateId, candidates]);

  const handleStageChange = async (newStage: CandidateStage) => {
    if (!candidate) return;

    try {
      setUpdatingStage(true);
      const updatedCandidate = await mockApi.updateCandidate(candidate.id, {
        stage: newStage,
      });
      setCandidate(updatedCandidate);
      updateCandidate(candidate.id, { stage: newStage });
    } catch (error) {
      console.error("Failed to update candidate stage:", error);
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleAddNote = () => {
    if (!candidate || !newNote.trim()) return;

    const note = {
      id: `note-${Date.now()}`,
      content: newNote,
      createdAt: new Date(),
      author: "Current User",
    };

    const updatedCandidate = {
      ...candidate,
      notes: [...(candidate.notes || []), note],
    };

    setCandidate(updatedCandidate);
    updateCandidate(candidate.id, { notes: updatedCandidate.notes });
    setNewNote("");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const renderMentions = (content: string) => {
    return content.replace(
      /@(\w+(?:\.\w+)?)/g,
      '<span class="text-primary font-medium">@$1</span>',
    );
  };

  if (loading) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  if (!candidate) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Candidate Not Found
            </h1>
            <p className="text-muted-foreground mb-4">
              The candidate you're looking for doesn't exist or has been
              removed.
            </p>
            <Button
              onClick={() => router.push("/candidates")}
              className="bg-primary hover:bg-primary/90"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Candidates
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const job = jobs.find((j) => j.id === candidate.jobId);
  const currentStage = stages.find((s) => s.value === candidate.stage);

  return (
    <main className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/candidates")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {getInitials(candidate.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  {candidate.name}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {candidate.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Applied {new Date(candidate.appliedAt).toLocaleDateString()}
                  </div>
                </div>
                {job && (
                  <div className="flex items-center gap-1 mt-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Applied for: {job.title}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {currentStage && (
                <Badge
                  className={`${currentStage.color} flex items-center gap-1`}
                >
                  <currentStage.icon className="h-3 w-3" />
                  {currentStage.label}
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[150px] justify-between bg-input"
                    disabled={updatingStage}
                  >
                    {currentStage?.label || "Select Stage"}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {stages.map((stage) => (
                    <DropdownMenuItem
                      key={stage.value}
                      onClick={() =>
                        handleStageChange(stage.value as CandidateStage)
                      }
                    >
                      {stage.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {index < timeline.length - 1 && (
                          <div className="w-px h-8 bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-card-foreground">
                            {event.event}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {event.stage}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {event.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidate.notes && candidate.notes.length > 0 ? (
                  candidate.notes.map((note) => (
                    <div
                      key={note.id}
                      className="border-l-2 border-primary pl-4 py-2"
                    >
                      <div
                        className="text-sm text-card-foreground mb-1"
                        dangerouslySetInnerHTML={{
                          __html: renderMentions(note.content),
                        }}
                      />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{note.author}</span>
                        <span>•</span>
                        <span>{note.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No notes yet.</p>
                )}

                <Separator />

                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a note... Use @mentions to reference team members"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="bg-input"
                    rows={3}
                  />
                  <Button
                    onClick={handleAddNote}
                    disabled={!newNote.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Candidate Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-card-foreground mb-1">
                    Email
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {candidate.email}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-card-foreground mb-1">
                    Application Date
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(candidate.appliedAt).toLocaleDateString()}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-card-foreground mb-1">
                    Last Updated
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {candidate.updatedAt.toLocaleDateString()}
                  </p>
                </div>

                {job && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-card-foreground mb-1">
                        Position
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {job.title}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Interview
                </Button>
                {job && (
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => router.push(`/assessments?job=${job.id}`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    View Assessment
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
