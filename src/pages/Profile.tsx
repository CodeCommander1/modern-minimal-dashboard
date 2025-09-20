import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, User, LineChart, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router";
import { useMemo, useState } from "react";

export default function ProfilePage() {
  const navigate = useNavigate();
  const data = useQuery(api.dashboard.getDashboardOverview);

  const name = data?.user?.name || "Student";
  const email = data?.user?.email || "—";
  const grade = data?.user?.academicLevel || "—";
  const interests = (data?.user as any)?.interests as Array<string> | undefined;

  const progressPct = useMemo(() => {
    if (!data?.progressData || data.progressData.length === 0) return 0;
    const totals = data.progressData.reduce(
      (acc, p) => {
        acc.done += p.currentLevel;
        acc.total += p.totalLevels;
        return acc;
      },
      { done: 0, total: 0 }
    );
    if (totals.total === 0) return 0;
    return Math.round((totals.done / totals.total) * 100);
  }, [data?.progressData]);

  const avgScore = useMemo(() => {
    const list = data?.recentScores ?? [];
    if (list.length === 0) return null;
    const s = list.reduce((acc, r) => acc + (r.score / r.maxScore) * 100, 0) / list.length;
    return Math.round(s);
  }, [data?.recentScores]);

  type TabKey = "personal" | "career" | "analysis" | "help" | "interests";
  const [tab, setTab] = useState<TabKey>("personal");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          {/* Top summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-lg font-semibold">{name}</p>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{email}</p>
                <p className="text-muted-foreground mt-2">Grade</p>
                <p className="font-medium">{grade}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-2xl font-bold">{progressPct}%</p>
                <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-2 bg-primary transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {data?.progressData?.length ?? 0} of {data?.progressData?.length ?? 0} milestones completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Scores
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {avgScore === null ? (
                  <div className="h-6 w-24 rounded bg-muted" />
                ) : (
                  <p className="text-2xl font-bold">{avgScore}%</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Average performance</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto">
            <button
              className={`px-4 py-2 rounded-full border ${tab === "personal" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              onClick={() => setTab("personal")}
            >
              Personal Details
            </button>
            <button
              className={`px-4 py-2 rounded-full border ${tab === "career" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              onClick={() => setTab("career")}
            >
              Career Details
            </button>
            <button
              className={`px-4 py-2 rounded-full border ${tab === "analysis" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              onClick={() => setTab("analysis")}
            >
              Analysis
            </button>
            <button
              className={`px-4 py-2 rounded-full border ${tab === "help" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              onClick={() => setTab("help")}
            >
              Help & FAQs
            </button>
            <button
              className={`px-4 py-2 rounded-full border ${tab === "interests" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              onClick={() => setTab("interests")}
            >
              Interests & Hobbies
            </button>
          </div>

          {/* Panels */}
          {tab === "personal" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-semibold">{name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-semibold">{email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Grade</p>
                  <p className="font-semibold">{grade}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Interests</p>
                  {interests && interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {interests.map((i) => (
                        <span key={i} className="text-[11px] rounded-md border bg-muted px-2 py-1">
                          {i}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="font-semibold">—</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "career" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Career Details</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground">Current Goal</p>
                <p className="font-medium">{data?.user?.currentCareerGoal || "Not set"}</p>
                <div className="mt-3">
                  <Button variant="outline" onClick={() => navigate("/career-goal")}>Manage Career Goal</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {tab === "analysis" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Analysis</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Your progress and scores overview will appear here as you add more data.
              </CardContent>
            </Card>
          )}

          {tab === "help" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Help & FAQs</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p className="font-medium">How do I update my career goal?</p>
                <p className="text-muted-foreground">Go to Career Goal and save a quick or SMART goal.</p>
                <p className="font-medium mt-3">How to add sample data?</p>
                <p className="text-muted-foreground">Use the “Add Sample Data” prompt on the Dashboard.</p>
              </CardContent>
            </Card>
          )}

          {tab === "interests" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Interests & Hobbies</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-muted-foreground mb-3">
                  Complete the questionnaire to get a recommended stream.
                </p>
                <Button onClick={() => navigate("/personal-interests")}>Open Questionnaire</Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}
