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
  const stats = [
    {
      title: "Active Jobs",
      value: "18",
      description: "+2 from last month",
      icon: Briefcase,
      color: "text-primary",
    },
    {
      title: "Total Candidates",
      value: "1,247",
      description: "+180 this week",
      icon: Users,
      color: "text-secondary",
    },
    {
      title: "Assessments",
      value: "3",
      description: "Ready to use",
      icon: ClipboardList,
      color: "text-accent",
    },
    {
      title: "Hire Rate",
      value: "24%",
      description: "+5% from last quarter",
      icon: TrendingUp,
      color: "text-chart-1",
    },
  ];

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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
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
                className="w-full justify-between bg-transparent"
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
                className="w-full justify-between bg-transparent"
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
                className="w-full justify-between bg-transparent"
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
