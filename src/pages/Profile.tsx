import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, User, LineChart, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router";
import { useMemo, useState } from "react";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

export default function ProfilePage() {
  const navigate = useNavigate();
  const data = useQuery(api.dashboard.getDashboardOverview);
  const class10Scores = useQuery(api.dashboard.getScoresByClassStream, { classLevel: "class10" }) ?? [];
  const class12Scores = useQuery(api.dashboard.getScoresByClassStream, { classLevel: "class12" }) ?? [];
  const openSeats = useQuery(api.dashboard.listOpenVacantSeats) ?? [];

  // Local persisted aptitude score (0-20) if not stored server-side
  const [aptScore, setAptScore] = useState<number>(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem("profile_aptitude_score") : null;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? Math.max(0, Math.min(20, n)) : 0;
  });
  const saveAptScore = () => {
    try {
      window.localStorage.setItem("profile_aptitude_score", String(aptScore));
    } catch {}
  };

  // Extract interests result if saved previously
  const interestsResult = (data?.user as any)?.interestsResult as
    | { science: number; commerce: number; arts: number; recommended?: "Science" | "Commerce" | "Arts" }
    | undefined;

  // Academic grouping for streams (Class 10)
  function computeAcademicStreamScores(items: Array<{ subject: string; score: number; maxScore: number }>) {
    const norm = (s: number, m: number) => (m > 0 ? (s / m) * 100 : 0);
    const buckets: Record<"Science" | "Commerce" | "Arts", Array<number>> = { Science: [], Commerce: [], Arts: [] };

    const sciSet = new Set(["science", "physics", "chemistry", "biology", "math", "mathematics"]);
    const comSet = new Set(["mathematics", "math", "economics", "business studies", "accountancy", "accounts"]);
    const artSet = new Set(["english", "history", "political science", "geography", "sociology", "social studies", "civics"]);

    for (const row of items) {
      const subj = (row.subject || "").toLowerCase().trim();
      const p = norm(Number(row.score) || 0, Number(row.maxScore) || 0);
      if (sciSet.has(subj)) buckets.Science.push(p);
      if (comSet.has(subj)) buckets.Commerce.push(p);
      if (artSet.has(subj)) buckets.Arts.push(p);
      // Heuristics for generic subject names
      if (subj === "science") buckets.Science.push(p);
      if (subj === "social science" || subj === "social studies") buckets.Arts.push(p);
    }

    const avg = (arr: Array<number>) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    return {
      Science: Math.round(avg(buckets.Science)),
      Commerce: Math.round(avg(buckets.Commerce)),
      Arts: Math.round(avg(buckets.Arts)),
    };
  }

  // Interests mapping to 0-100 by normalizing to total answered
  function computeInterestsStreamScores(ir: typeof interestsResult | undefined) {
    if (!ir) return { Science: 0, Commerce: 0, Arts: 0 };
    const s = Math.max(0, ir.science || 0);
    const c = Math.max(0, ir.commerce || 0);
    const a = Math.max(0, ir.arts || 0);
    const total = s + c + a;
    if (total === 0) return { Science: 0, Commerce: 0, Arts: 0 };
    return {
      Science: Math.round((s / total) * 100),
      Commerce: Math.round((c / total) * 100),
      Arts: Math.round((a / total) * 100),
    };
  }

  // Aptitude contribution: map 0-20 to 0-100 uniformly for all streams (neutral aptitude)
  function computeAptitudeStreamScores(score0to20: number) {
    const pct = Math.max(0, Math.min(20, score0to20)) * 5; // 20 -> 100
    return { Science: pct, Commerce: pct, Arts: pct };
  }

  // Duplicate openSeats declaration removed

  // Stream-based course recommendations (simple, lightweight)
  function getCoursesForStream(stream: "Science" | "Commerce" | "Arts"): Array<string> {
    if (stream === "Science") {
      return ["B.Tech (CSE/ME/EE)", "MBBS/BDS", "B.Sc (Physics/Chem/Math)", "BCA", "Data Science"];
    }
    if (stream === "Commerce") {
      return ["B.Com", "BBA", "Economics (Hons)", "CA/CS/CMA (pro)", "Banking & Finance"];
    }
    return ["BA (Hons)", "BJMC (Journalism)", "B.Des", "Fine Arts", "Psychology"];
  }

  // Stream-based top colleges (static + concise)
  function getTopCollegesForStream(stream: "Science" | "Commerce" | "Arts"): Array<string> {
    if (stream === "Science") {
      return ["IIT Bombay", "IIT Delhi", "AIIMS Delhi", "IISc Bangalore", "NIT Trichy"];
    }
    if (stream === "Commerce") {
      return ["SRCC (DU)", "Christ University", "NMIMS", "St. Xavier's", "DU Colleges"];
    }
    return ["JNU", "University of Delhi", "NID Ahmedabad", "NIFT Delhi", "Jamia Millia Islamia"];
  }

  // Weights
  const W_ACAD = 0.4;
  const W_INT = 0.3;
  const W_APT = 0.3;

  // Compute components
  const academic = computeAcademicStreamScores(class10Scores as any);
  const interestsScores = computeInterestsStreamScores(interestsResult);
  const aptitude = computeAptitudeStreamScores(aptScore);

  // Final per-stream scores
  const finalScores = {
    Science: Math.round(W_ACAD * academic.Science + W_INT * interestsScores.Science + W_APT * aptitude.Science),
    Commerce: Math.round(W_ACAD * academic.Commerce + W_INT * interestsScores.Commerce + W_APT * aptitude.Commerce),
    Arts: Math.round(W_ACAD * academic.Arts + W_INT * interestsScores.Arts + W_APT * aptitude.Arts),
  };

  const recommendedStream = (() => {
    // Fix: use a mutable, explicitly-typed array (not `as const`) to allow sorting
    const entries: Array<["Science" | "Commerce" | "Arts", number]> = [
      ["Science", finalScores.Science],
      ["Commerce", finalScores.Commerce],
      ["Arts", finalScores.Arts],
    ];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  })();

  // Pie: contribution breakdown for the recommended stream
  const contribPieData = (() => {
    const pick = recommendedStream;
    const a = W_ACAD * (academic as any)[pick];
    const i = W_INT * (interestsScores as any)[pick];
    const t = W_APT * (aptitude as any)[pick];
    const total = a + i + t || 1;
    return [
      { name: "Academics", value: Math.round((a / total) * 100) },
      { name: "Interests", value: Math.round((i / total) * 100) },
      { name: "Aptitude", value: Math.round((t / total) * 100) },
    ];
  })();

  const barData = [
    { stream: "Science", score: finalScores.Science },
    { stream: "Commerce", score: finalScores.Commerce },
    { stream: "Arts", score: finalScores.Arts },
  ];

  const PIE_COLORS = [
    "oklch(70% 0.12 140)", // Academics
    "oklch(70% 0.16 60)",  // Interests
    "oklch(70% 0.15 25)",  // Aptitude
  ];

  // Class 12 computations (parallel to Class 10)
  const academic12 = computeAcademicStreamScores(class12Scores as any);
  const finalScores12 = {
    Science: Math.round(W_ACAD * academic12.Science + W_INT * interestsScores.Science + W_APT * aptitude.Science),
    Commerce: Math.round(W_ACAD * academic12.Commerce + W_INT * interestsScores.Commerce + W_APT * aptitude.Commerce),
    Arts: Math.round(W_ACAD * academic12.Arts + W_INT * interestsScores.Arts + W_APT * aptitude.Arts),
  };

  const recommendedStream12 = (() => {
    const entries: Array<["Science" | "Commerce" | "Arts", number]> = [
      ["Science", finalScores12.Science],
      ["Commerce", finalScores12.Commerce],
      ["Arts", finalScores12.Arts],
    ];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0][0];
  })();

  const contribPieData12 = (() => {
    const pick = recommendedStream12;
    const a = W_ACAD * (academic12 as any)[pick];
    const i = W_INT * (interestsScores as any)[pick];
    const t = W_APT * (aptitude as any)[pick];
    const total = a + i + t || 1;
    return [
      { name: "Academics", value: Math.round((a / total) * 100) },
      { name: "Interests", value: Math.round((i / total) * 100) },
      { name: "Aptitude", value: Math.round((t / total) * 100) },
    ];
  })();

  const barData12 = [
    { stream: "Science", score: finalScores12.Science },
    { stream: "Commerce", score: finalScores12.Commerce },
    { stream: "Arts", score: finalScores12.Arts },
  ];

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

              {/* Recommended Stream Section */}
              <CardContent className="mt-4 space-y-4">
                <Tabs defaultValue="class10" className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="class10">Class 10</TabsTrigger>
                    <TabsTrigger value="class12">Class 12</TabsTrigger>
                  </TabsList>

                  {/* Class 10 Panel */}
                  <TabsContent value="class10" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Recommended Stream</p>
                        <p className="text-xl font-semibold mt-1">{recommendedStream}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on 40% Academics (Class 10), 30% Interests, 30% Aptitude.
                        </p>

                        {/* All Streams compact chips (Class 10) */}
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-1">All Streams</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium bg-[oklch(96%_0.03_140)] text-[oklch(35%_0.09_140)]">
                              Science:
                              <span className="ml-1 font-semibold text-[oklch(30%_0.12_140)]">{finalScores.Science}%</span>
                            </span>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium bg-[oklch(96%_0.03_60)] text-[oklch(35%_0.10_60)]">
                              Commerce:
                              <span className="ml-1 font-semibold text-[oklch(30%_0.14_60)]">{finalScores.Commerce}%</span>
                            </span>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium bg-[oklch(96%_0.03_25)] text-[oklch(35%_0.10_25)]">
                              Arts:
                              <span className="ml-1 font-semibold text-[oklch(30%_0.13_25)]">{finalScores.Arts}%</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Control panel */}
                      <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={aptScore}
                          onChange={(e) => setAptScore(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
                          className="w-28 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          aria-label="Aptitude score out of 20"
                        />
                        <Button size="sm" variant="outline" onClick={saveAptScore}>Save</Button>
                        <Button size="sm" onClick={() => { /* recompute via state changes */ }}>
                          Update
                        </Button>
                        <Button size="sm" variant="default" onClick={() => navigate("/career-path")}>
                          View Suggestions
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Pie: Contribution Breakdown (Class 10) */}
                      <div className="lg:col-span-1">
                        <p className="text-xs text-muted-foreground mb-2">
                          Contribution Breakdown ({recommendedStream})
                        </p>
                        <div className="h-56">
                          <ChartContainer
                            id="profile-reco-pie-c10"
                            config={{
                              Academics: { label: "Academics", color: PIE_COLORS[0] },
                              Interests: { label: "Interests", color: PIE_COLORS[1] },
                              Aptitude: { label: "Aptitude", color: PIE_COLORS[2] },
                            }}
                            className="w-full h-full"
                          >
                            <ResponsiveContainer>
                              <RePieChart>
                                <Pie
                                  data={contribPieData}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={80}
                                  paddingAngle={3}
                                  stroke="hsl(var(--border))"
                                  strokeWidth={1}
                                >
                                  {contribPieData.map((_, idx) => (
                                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                  ))}
                                </Pie>
                                <ReTooltip content={<ChartTooltipContent nameKey="name" labelKey="name" indicator="dot" />} />
                                <ReLegend />
                              </RePieChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </div>

                      {/* Bar: Stream Comparison (Class 10) */}
                      <div className="lg:col-span-2">
                        <p className="text-xs text-muted-foreground mb-2">Stream Score Comparison</p>
                        <div className="h-56">
                          <ChartContainer
                            id="profile-reco-bar-c10"
                            config={{
                              score: { label: "Score", color: "hsl(var(--primary))" },
                            }}
                            className="w-full h-full"
                          >
                            <ResponsiveContainer>
                              <ReBarChart data={barData}>
                                <XAxis dataKey="stream" />
                                <YAxis />
                                <ReTooltip content={<ChartTooltipContent nameKey="stream" labelKey="stream" indicator="dot" />} />
                                <ReLegend />
                                <Bar dataKey="score" fill="hsl(var(--primary))" />
                              </ReBarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Class 12 Panel */}
                  <TabsContent value="class12" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Recommended Stream</p>
                        <p className="text-xl font-semibold mt-1">{recommendedStream12}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on 40% Academics (Class 12), 30% Interests, 30% Aptitude.
                        </p>

                        {/* All Streams compact chips (Class 12) */}
                        <div className="mt-3">
                          <p className="text-xs text-muted-foreground mb-1">All Streams</p>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium bg-[oklch(96%_0.03_140)] text-[oklch(35%_0.09_140)]">
                              Science:
                              <span className="ml-1 font-semibold text-[oklch(30%_0.12_140)]">{finalScores12.Science}%</span>
                            </span>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium bg-[oklch(96%_0.03_60)] text-[oklch(35%_0.10_60)]">
                              Commerce:
                              <span className="ml-1 font-semibold text-[oklch(30%_0.14_60)]">{finalScores12.Commerce}%</span>
                            </span>
                            <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium bg-[oklch(96%_0.03_25)] text-[oklch(35%_0.10_25)]">
                              Arts:
                              <span className="ml-1 font-semibold text-[oklch(30%_0.13_25)]">{finalScores12.Arts}%</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Control panel (shared aptitude input) */}
                      <div className="flex items-center gap-2 bg-muted/50 rounded-md p-2">
                        <input
                          type="number"
                          min={0}
                          max={20}
                          value={aptScore}
                          onChange={(e) => setAptScore(Math.max(0, Math.min(20, Number(e.target.value) || 0)))}
                          className="w-28 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                          aria-label="Aptitude score out of 20"
                        />
                        <Button size="sm" variant="outline" onClick={saveAptScore}>Save</Button>
                        <Button size="sm" onClick={() => { /* recompute via state changes */ }}>
                          Update
                        </Button>
                        <Button size="sm" variant="default" onClick={() => navigate("/career-path")}>
                          View Suggestions
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Pie: Contribution Breakdown (Class 12) */}
                      <div className="lg:col-span-1">
                        <p className="text-xs text-muted-foreground mb-2">
                          Contribution Breakdown ({recommendedStream12})
                        </p>
                        <div className="h-56">
                          <ChartContainer
                            id="profile-reco-pie-c12"
                            config={{
                              Academics: { label: "Academics", color: PIE_COLORS[0] },
                              Interests: { label: "Interests", color: PIE_COLORS[1] },
                              Aptitude: { label: "Aptitude", color: PIE_COLORS[2] },
                            }}
                            className="w-full h-full"
                          >
                            <ResponsiveContainer>
                              <RePieChart>
                                <Pie
                                  data={contribPieData12}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={40}
                                  outerRadius={80}
                                  paddingAngle={3}
                                  stroke="hsl(var(--border))"
                                  strokeWidth={1}
                                >
                                  {contribPieData12.map((_, idx) => (
                                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                                  ))}
                                </Pie>
                                <ReTooltip content={<ChartTooltipContent nameKey="name" labelKey="name" indicator="dot" />} />
                                <ReLegend />
                              </RePieChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </div>

                      {/* Bar: Stream Comparison (Class 12) */}
                      <div className="lg:col-span-2">
                        <p className="text-xs text-muted-foreground mb-2">Stream Score Comparison</p>
                        <div className="h-56">
                          <ChartContainer
                            id="profile-reco-bar-c12"
                            config={{
                              score: { label: "Score", color: "hsl(var(--primary))" },
                            }}
                            className="w-full h-full"
                          >
                            <ResponsiveContainer>
                              <ReBarChart data={barData12}>
                                <XAxis dataKey="stream" />
                                <YAxis />
                                <ReTooltip content={<ChartTooltipContent nameKey="stream" labelKey="stream" indicator="dot" />} />
                                <ReLegend />
                                <Bar dataKey="score" fill="hsl(var(--primary))" />
                              </ReBarChart>
                            </ResponsiveContainer>
                          </ChartContainer>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* NEW: Recommended Courses */}
                <div className="mt-6 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Recommended Courses</p>
                      <p className="text-xs text-muted-foreground">
                        Curated from your {recommendedStream} fit and overall aptitude.
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => navigate("/career-path")}>
                      View Career Path
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getCoursesForStream(recommendedStream).map((c) => (
                      <span key={c} className="text-xs rounded-md border bg-muted px-2.5 py-1">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* NEW: College Suggestions */}
                <div className="mt-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Recommended Colleges</p>
                      <p className="text-xs text-muted-foreground">
                        Based on stream fit and current openings (if available).
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => window.open("/government-colleges", "_blank", "noopener,noreferrer")}
                    >
                      Open All
                    </Button>
                  </div>

                  {/* Static top picks */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getTopCollegesForStream(recommendedStream).map((c) => (
                      <span key={c} className="text-xs rounded-md border bg-muted/60 px-2.5 py-1">
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Live open seats (if any) */}
                  {(openSeats ?? []).length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-2">Open Seats</p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {(openSeats ?? []).slice(0, 4).map((s) => (
                          <div key={s._id} className="rounded-md border p-2 text-xs">
                            <div className="flex justify-between">
                              <span className="font-medium">{s.collegeName}</span>
                              <span className="text-green-600">Open</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-muted-foreground">Branch: {s.branch}</span>
                              <span>Seats: {s.seats}</span>
                            </div>
                            <p className="mt-1">Apply by: {new Date(s.lastDate).toLocaleDateString()}</p>
                            {s.notes && <p className="text-[11px] text-muted-foreground mt-1">{s.notes}</p>}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate("/dashboard")}
                          title="Go to dashboard to see seats module"
                        >
                          Apply to Colleges
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* NEW: Career Path – Next Steps */}
                <div className="mt-4 rounded-lg border p-4">
                  <p className="text-sm font-semibold">Career Path — Next Steps</p>
                  <p className="text-xs text-muted-foreground">
                    Short-term actions and a simple long-term direction aligned to {recommendedStream}.
                  </p>
                  <div className="mt-3 grid sm:grid-cols-2 gap-3 text-sm">
                    {/* Short-term */}
                    <div className="rounded-md border p-3">
                      <p className="text-xs text-muted-foreground mb-2">Short-term</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {recommendedStream === "Science" && (
                          <>
                            <li>Select core subjects (PCM/PCB) for Class 11</li>
                            <li>Start prep for JEE/NEET basics</li>
                            <li>Strengthen Math/Science fundamentals</li>
                          </>
                        )}
                        {recommendedStream === "Commerce" && (
                          <>
                            <li>Choose Accountancy/Economics/Math</li>
                            <li>Explore CA/CS Foundation basics</li>
                            <li>Practice logical reasoning & data analysis</li>
                          </>
                        )}
                        {recommendedStream === "Arts" && (
                          <>
                            <li>Pick strong humanities subjects</li>
                            <li>Build a reading/writing or design portfolio</li>
                            <li>Practice communication and critical thinking</li>
                          </>
                        )}
                      </ul>
                    </div>
                    {/* Long-term */}
                    <div className="rounded-md border p-3">
                      <p className="text-xs text-muted-foreground mb-2">Long-term</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {recommendedStream === "Science" && (
                          <>
                            <li>Target roles: Software Engineer, Doctor, Data Scientist</li>
                            <li>Plan internships and projects in tech/health</li>
                            <li>Prepare for relevant entrance exams</li>
                          </>
                        )}
                        {recommendedStream === "Commerce" && (
                          <>
                            <li>Target roles: CA, Investment Analyst, Business Manager</li>
                            <li>Internships in finance/startups</li>
                            <li>Explore certifications (CFA, NISM)</li>
                          </>
                        )}
                        {recommendedStream === "Arts" && (
                          <>
                            <li>Target roles: Journalist, Designer, Policy Analyst</li>
                            <li>Real-world projects, communication skills</li>
                            <li>Entrance tests for design/media/law if relevant</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => navigate("/career-path")}>
                      View Career Path
                    </Button>
                    <Button size="sm" onClick={() => window.open("/government-colleges", "_blank", "noopener,noreferrer")}>
                      Explore Colleges
                    </Button>
                  </div>
                </div>
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
                <p className="text-muted-foreground">Use the "Add Sample Data" prompt on the Dashboard.</p>
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