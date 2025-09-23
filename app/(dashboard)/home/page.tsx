"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  Users,
  ClipboardList,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your hiring pipeline today.
          </p>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-card-foreground">
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/jobs">
              <Button
                variant="outline"
                className="w-full justify-between bg-transparent cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create New Job
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/candidates">
              <Button
                variant="outline"
                className="w-full justify-between bg-transparent cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  View All Candidates
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/assessments">
              <Button
                variant="outline"
                className="w-full justify-between bg-transparent cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Build Assessment
                </div>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
