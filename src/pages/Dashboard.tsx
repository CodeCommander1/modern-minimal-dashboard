import { DashboardCard } from "@/components/DashboardCard";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import {
  TrendingUp,
  CheckSquare,
  Target,
  BarChart3,
  LineChart,
  GraduationCap,
  Trophy,
  BookOpen,
  ClipboardList,
  PieChart,
  Lightbulb,
  Award,
  Heart,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
// Restore Select imports to fix runtime error where <Select/> is still used somewhere in this file
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
// ADD: Chart helpers and Recharts
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart as RePieChart, Pie, Cell, Tooltip as ReTooltip, Legend as ReLegend, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const dashboardData = useQuery(api.dashboard.getDashboardOverview);
  const seedData = useMutation(api.seedData.seedDashboardData);
  const setCareerGoal = useMutation(api.dashboard.setCareerGoal);

  // Local state for career goal input
  const [goalInput, setGoalInput] = useState<string>("");

  // Interests & Hobbies modal state
  const [interestsOpen, setInterestsOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<number, "Science" | "Commerce" | "Arts" | null>>({});
  const [result, setResult] = useState<{ science: number; commerce: number; arts: number; recommended: "Science" | "Commerce" | "Arts" } | null>(null);
  const saveInterests = useMutation(api.dashboard.saveInterestsResult);

  // 20 questions (one choice each)
  const QUESTIONS: Array<string> = [
    "Which activity excites you more? * Doing experiments in a lab (Science) * Calculating profits and losses (Commerce) * Writing a poem or story (Arts)",
    "You are asked to join a school club. Which one will you choose? * Robotics Club (Science) * Business/Finance Club (Commerce) * Drama or Painting Club (Arts)",
    "What do you enjoy reading most? * Space, medicine, or technology (Science) * Stock market, trade, and money (Commerce) * History, literature, or philosophy (Arts)",
    "Which subject do you naturally find interesting? * Physics/Chemistry/Biology (Science) * Mathematics/Economics/Accounts (Commerce) * English/History/Political Science (Arts)",
    "If given a project, what would you prefer? * Building a science model (Science) * Preparing a business plan (Commerce) * Creating an art piece/documentary (Arts)",
    "Which career sounds exciting? * Doctor/Engineer/Scientist (Science) * Entrepreneur/Banker/CA (Commerce) * Writer/Journalist/Designer (Arts)",
    "Which type of movie do you enjoy more? * Sci-fi/medical thrillers (Science) * Business/financial dramas (Commerce) * Historical/creative films (Arts)",
    "How do you like solving problems? * By experimenting and testing (Science) * By analyzing numbers and logic (Commerce) * By expressing ideas creatively (Arts)",
    "Which extracurricular activity attracts you? * Science quiz (Science) * Debate on economy (Commerce) * Theater/Art competition (Arts)",
    "What motivates you most? * Discovering new knowledge (Science) * Earning and managing money (Commerce) * Expressing creativity (Arts)",
    "If you had to research a topic, what would it be? * Renewable energy (Science) * Growth of Indian economy (Commerce) * Ancient civilizations (Arts)",
    "Which puzzle do you enjoy? * Logical/scientific puzzle (Science) * Numerical/profit-loss puzzle (Commerce) * Word/creative puzzle (Arts)",
    "Which TV show do you prefer? * Discovery/Science Channel (Science) * Shark Tank/Business shows (Commerce) * National Geographic History/Art shows (Arts)",
    "What excites you in real life? * Inventions and new technology (Science) * Business startups and markets (Commerce) * Museums, books, and culture (Arts)",
    "If you had a budget, how would you use it? * Buy lab equipment (Science) * Invest in stocks (Commerce) * Create an art exhibition (Arts)",
  ];

  // --- ADD: Aptitude Test state and questions ---
  const [aptitudeOpen, setAptitudeOpen] = useState(false);
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<number, number | null>>({});
  const [aptitudeScore, setAptitudeScore] = useState<number | null>(null);

  type MCQ = { q: string; options: Array<string>; correctIndex: number };
  const APTITUDE_QUESTIONS: Array<MCQ> = [
    // Quantitative Aptitude
    { q: "1. What is the value of 25 × 12?", options: ["A) 250", "B) 300", "C) 325", "D) 275"], correctIndex: 1 },
    { q: "2. A man buys an article for ₹500 and sells it at a profit of 20%. What is the selling price?", options: ["A) ₹600", "B) ₹550", "C) ₹520", "D) ₹700"], correctIndex: 0 },
    { q: "3. If 12 pens cost ₹144, what is the cost of 1 pen?", options: ["A) ₹10", "B) ₹12", "C) ₹14", "D) ₹16"], correctIndex: 1 },
    { q: "4. The average of 10, 20, 30, 40, 50 is:", options: ["A) 20", "B) 25", "C) 30", "D) 35"], correctIndex: 2 },
    { q: "5. A train 120 m long runs at 60 km/h. Time taken to cross a pole?", options: ["A) 6 sec", "B) 7 sec", "C) 10 sec", "D) 12 sec"], correctIndex: 0 },

    // Logical Reasoning
    { q: "6. Find the next number: 2, 6, 12, 20, ?", options: ["A) 28", "B) 30", "C) 32", "D) 34"], correctIndex: 1 },
    { q: "7. Which is the odd one out?", options: ["A) Rose", "B) Lotus", "C) Sunflower", "D) Mango"], correctIndex: 3 },
    { q: "8. If CAT = 3120, DOG = 4157, then RAT = ?", options: ["A) 18120", "B) 18120", "C) 18120", "D) 18120"], correctIndex: 3 },
    { q: "9. A is taller than B, B is taller than C, C is taller than D. Who is shortest?", options: ["A) A", "B) B", "C) C", "D) D"], correctIndex: 3 },
    { q: "10. If in a certain code, PEN = 35, then BOOK = ?", options: ["A) 43", "B) 41", "C) 45", "D) 47"], correctIndex: 1 },

    // Verbal Ability / Reasoning
    { q: "11. Choose the synonym of Rapid:", options: ["A) Quick", "B) Slow", "C) Weak", "D) Normal"], correctIndex: 0 },
    { q: "12. Choose the antonym of Difficult:", options: ["A) Easy", "B) Hard", "C) Tough", "D) Strong"], correctIndex: 0 },
    { q: '13. Rearrange to form a correct sentence: "playing / children / the / are / garden / in / the"', options: ["A) The children are playing in the garden", "B) Playing children the in garden are", "C) Garden in are the playing children", "D) None"], correctIndex: 0 },
    { q: "14. Fill in the blank: He ___ to school every day.", options: ["A) Go", "B) Going", "C) Goes", "D) Gone"], correctIndex: 2 },
    { q: "15. Identify the correctly spelled word:", options: ["A) Recieve", "B) Receive", "C) Recive", "D) Receeve"], correctIndex: 1 },

    // Mixed Aptitude
    { q: "16. A clock shows 3:15. What is the angle between the hands?", options: ["A) 37.5°", "B) 45°", "C) 47.5°", "D) 55°"], correctIndex: 0 },
    { q: "17. If 5x = 25, then x = ?", options: ["A) 2", "B) 3", "C) 4", "D) 5"], correctIndex: 3 },
    { q: "18. The square root of 784 is:", options: ["A) 26", "B) 28", "C) 30", "D) 24"], correctIndex: 0 },
    { q: "19. Which is not a prime number?", options: ["A) 11", "B) 13", "C) 15", "D) 17"], correctIndex: 2 },
    { q: "20. If 4 pencils cost ₹20, how much will 10 pencils cost?", options: ["A) ₹40", "B) ₹45", "C) ₹50", "D) ₹55"], correctIndex: 2 },
  ];

  // Add: College role detection
  const [isCollege, setIsCollege] = useState(false);
  useEffect(() => {
    try {
      setIsCollege(localStorage.getItem("userRole") === "college");
    } catch {}
  }, []);

  // Add: Vacant Seats hooks
  const createVacantSeat = useMutation(api.dashboard.createVacantSeat);
  const mySeats = useQuery(api.dashboard.listMyVacantSeats);
  const openSeats = useQuery(api.dashboard.listOpenVacantSeats);

  // Add: Vacant Seats dialog state
  const [seatDialogOpen, setSeatDialogOpen] = useState(false);
  const [vsCollegeName, setVsCollegeName] = useState("");
  const [vsBranch, setVsBranch] = useState("");
  const [vsSeats, setVsSeats] = useState<string>("");
  const [vsLastDate, setVsLastDate] = useState(""); // DD/MM/YYYY
  const [vsNotes, setVsNotes] = useState("");

  function parseDdMmYyyyToMs(input: string): number | null {
    const m = input.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return null;
    const dd = Number(m[1]);
    const mm = Number(m[2]) - 1;
    const yyyy = Number(m[3]);
    const d = new Date(yyyy, mm, dd, 23, 59, 59, 999);
    if (Number.isNaN(d.getTime())) return null;
    return d.getTime();
  }

  async function handleCreateSeat() {
    const seatsNum = Number(vsSeats);
    const lastMs = parseDdMmYyyyToMs(vsLastDate);
    if (!vsCollegeName.trim() || !vsBranch.trim()) {
      toast.error("College name and Branch are required");
      return;
    }
    if (!Number.isFinite(seatsNum) || seatsNum <= 0) {
      toast.error("Enter a valid number of seats");
      return;
    }
    if (lastMs === null) {
      toast.error("Enter last date as DD/MM/YYYY");
      return;
    }

    try {
      await createVacantSeat({
        collegeName: vsCollegeName,
        branch: vsBranch,
        seats: Math.floor(seatsNum),
        lastDate: lastMs,
        notes: vsNotes || undefined,
      });
      toast.success("Vacant seat entry added");
      setSeatDialogOpen(false);
      setVsCollegeName("");
      setVsBranch("");
      setVsSeats("");
      setVsLastDate("");
      setVsNotes("");
    } catch (e) {
      toast.error("Failed to add entry");
    }
  }

  function resetInterests() {
    setAnswers({});
    setResult(null);
  }

  function submitInterests() {
    // Count selections; each chosen option adds 1 point to its stream
    let s = 0, c = 0, a = 0;
    for (let i = 0; i < QUESTIONS.length; i++) {
      const pick = answers[i] || null;
      if (pick === "Science") s += 1;
      if (pick === "Commerce") c += 1;
      if (pick === "Arts") a += 1;
    }
    const max = Math.max(s, c, a);
    const recommended = (max === s ? "Science" : max === c ? "Commerce" : "Arts") as "Science" | "Commerce" | "Arts";
    setResult({ science: s, commerce: c, arts: a, recommended });
  }

  function submitAptitude() {
    let score = 0;
    for (let i = 0; i < APTITUDE_QUESTIONS.length; i++) {
      const sel = aptitudeAnswers[i];
      if (sel !== null && sel !== undefined && sel === APTITUDE_QUESTIONS[i].correctIndex) {
        score += 1;
      }
    }
    setAptitudeScore(score);
  }

  function resetAptitude() {
    setAptitudeAnswers({});
    setAptitudeScore(null);
  }

  async function saveInterestsRecommendation() {
    if (!result) {
      toast.error("Please submit the questionnaire first");
      return;
    }
    try {
      await saveInterests({
        science: result.science,
        commerce: result.commerce,
        arts: result.arts,
        recommended: result.recommended,
      });
      toast.success("Recommendation saved to your profile");
      setInterestsOpen(false);
    } catch {
      toast.error("Failed to save recommendation");
    }
  }

  // Fetch all scores for Class 10 and Class 12 to drive the pie charts
  const class10Scores = useQuery(api.dashboard.getScoresByClassStream, { classLevel: "class10" }) ?? [];
  const class12Scores = useQuery(api.dashboard.getScoresByClassStream, { classLevel: "class12" }) ?? [];

  // Helper: Build category distribution for a set of scores
  // Categories:
  // - Strong Areas: percentage >= 80
  // - Needs Improvement: 50 <= percentage < 80
  // - Weaknesses: percentage < 50
  function buildCategoryDistribution(
    items: Array<{ subject: string; score: number; maxScore: number }>
  ): Array<{ name: "Strong Areas" | "Needs Improvement" | "Weaknesses"; value: number }> {
    // Aggregate by subject to avoid duplicates, summing scores and maxScore
    const bySubject: Record<string, { total: number; max: number }> = {};
    for (const s of items) {
      if (!s?.subject) continue;
      if (!bySubject[s.subject]) bySubject[s.subject] = { total: 0, max: 0 };
      bySubject[s.subject].total += Number(s.score) || 0;
      bySubject[s.subject].max += Number(s.maxScore) || 0;
    }

    let strong = 0;
    let mid = 0;
    let weak = 0;

    for (const { total, max } of Object.values(bySubject)) {
      const pct = max > 0 ? (total / max) * 100 : 0;
      if (pct >= 80) strong += 1;
      else if (pct >= 50) mid += 1;
      else weak += 1;
    }

    // If no subjects available, show a neutral baseline so the chart renders
    if (strong + mid + weak === 0) {
      return [
        { name: "Strong Areas", value: 1 },
        { name: "Needs Improvement", value: 1 },
        { name: "Weaknesses", value: 1 },
      ];
    }

    return [
      { name: "Strong Areas", value: strong },
      { name: "Needs Improvement", value: mid },
      { name: "Weaknesses", value: weak },
    ];
  }

  const class10Distribution = buildCategoryDistribution(class10Scores as any);
  const class12Distribution = buildCategoryDistribution(class12Scores as any);

  const CATEGORY_COLORS: Record<string, string> = {
    "Strong Areas": "oklch(70% 0.12 140)", // green-ish
    "Needs Improvement": "oklch(70% 0.16 60)", // warm yellow/orange
    "Weaknesses": "oklch(70% 0.15 25)", // red-ish
  };

  useEffect(() => {
    setGoalInput(dashboardData?.user?.currentCareerGoal ?? "");
  }, [dashboardData?.user?.currentCareerGoal]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleSeedData = async () => {
    try {
      await seedData();
      toast.success("Sample data added to your dashboard!");
    } catch (error) {
      toast.error("Failed to add sample data");
    }
  };

  const handleSaveGoal = async () => {
    try {
      const value = goalInput.trim();
      if (!value) {
        toast.error("Please enter a career goal");
        return;
      }
      await setCareerGoal({ currentCareerGoal: value });
      toast.success("Career goal updated");
    } catch {
      toast.error("Failed to update career goal");
    }
  };

  // Add lightweight college recommendations based on the user's current career goal
  const currentGoal = dashboardData?.user?.currentCareerGoal ?? "";
  const collegesMap: Record<string, Array<string>> = {
    Engineer: ["IITs", "NITs", "BITS"],
    "Computer Science": ["IITs", "IIITs", "Private Universities"],
    "Data Science": ["IITs", "IIITs", "Private Universities"],
    Doctor: ["AIIMS", "CMC Vellore", "JIPMER"],
    Architecture: ["SPA Delhi", "IIT Roorkee", "CEPT"],
    Aviation: ["Indigo Cadet Program", "IGRUA"],
    Biotechnology: ["IITs", "IISc", "Amity"],
    "Hotel Management": ["IHM", "Private Hospitality Schools"],
    "Investment Banking": ["Top MBA Schools", "CFA Route"],
    "Logistics": ["IIMs (PG)", "University Programs"],
    "BBA": ["NMIMS", "Christ University", "IPU Colleges"],
    "BA (Economics)": ["Delhi School of Economics", "St. Xavier's"],
    "Banking & Insurance": ["Public Universities", "Private Colleges"],
    "Company Secretary": ["ICSI (professional route)"],
    "Cost & Management Accountant": ["ICMAI (professional route)"],
    "Social Work": ["TISS (PG focus)", "Public Universities"],
    Sociology: ["DU", "State Universities"],
    "B.Com": ["SRCC", "Loyola", "Christ University"],
    Design: ["NID", "IIT IDC", "Pearl Academy"],
    Education: ["DU", "State Universities"],
    "Fine Arts": ["JJ School of Art", "DU Colleges"],
    "Foreign Languages": ["JNU (CSE)", "DU", "Private Institutes"],
    History: ["DU", "AMU", "Public Universities"],
    Journalism: ["IIMC", "Symbiosis", "DU"],
    Law: ["NLUs", "Symbiosis Law", "DU"],
    "Political Science": ["DU", "JNU (PG)", "Public Universities"],
    Psychology: ["DU", "Christ University"],
  };
  function getRecommendedColleges(goal: string): Array<string> {
    const key = Object.keys(collegesMap).find((k) =>
      goal.toLowerCase().includes(k.toLowerCase()),
    );
    return key ? collegesMap[key] : ["DU", "State Universities", "Private Colleges"];
  }
  const recommendedColleges = getRecommendedColleges(currentGoal);

  // ADD: Build weaknesses data from recent scores
  const weaknessesData = (() => {
    const entries = dashboardData?.recentScores ?? [];
    const agg: Record<string, { total: number; max: number }> = {};
    for (const s of entries) {
      if (!s || !s.subject) continue;
      if (!agg[s.subject]) agg[s.subject] = { total: 0, max: 0 };
      agg[s.subject].total += Number(s.score) || 0;
      agg[s.subject].max += Number(s.maxScore) || 0;
    }
    const arr = Object.entries(agg)
      .map(([subject, { total, max }]) => {
        const pct = max > 0 ? (total / max) * 100 : 0;
        const weakness = Math.max(0, Math.round(100 - pct));
        return { name: subject, value: weakness };
      })
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    if (arr.length === 0) {
      // Fallback to guide users when no scores exist
      return [
        { name: "Math", value: 40 },
        { name: "Physics", value: 30 },
        { name: "Chemistry", value: 20 },
        { name: "English", value: 10 },
      ];
    }
    return arr;
  })();

  const PIE_COLORS: Array<string> = [
    "hsl(var(--primary))",
    "oklch(70% 0.15 25)",
    "oklch(70% 0.12 140)",
    "oklch(70% 0.13 300)",
    "oklch(70% 0.16 60)",
    "oklch(70% 0.12 210)",
  ];

  // Add a curated list of Government Colleges (India)
  const GOV_COLLEGES: Array<string> = [
    // Engineering & Tech
    "IISc Bangalore",
    "IIT Bombay",
    "IIT Delhi",
    "IIT Madras",
    "IIT Kanpur",
    "IIT Kharagpur",
    "IIT Roorkee",
    "IIT Guwahati",
    "IIT (BHU) Varanasi",
    "IIT Dhanbad (ISM)",
    "IIT Hyderabad",
    "IIT Gandhinagar",
    "IIT Indore",
    "IIT Ropar",
    "IIT Mandi",
    "IIT Jodhpur",
    "IIT Patna",
    "IIT Bhubaneswar",
    "IIT Tirupati",
    "IIT Palakkad",
    "NIT Trichy",
    "NIT Surathkal",
    "NIT Warangal",
    "NIT Rourkela",
    "NIT Calicut",
    "DTU (Delhi Technological University)",
    "NSUT Delhi",
    "Jadavpur University (Engineering)",
    "Anna University",
    "COEP Tech Pune",
    "MNNIT Allahabad",
    "IIIT Hyderabad",
    "IIIT Bangalore",

    // Medical & Health Sciences
    "AIIMS Delhi",
    "AIIMS Bhopal",
    "AIIMS Bhubaneswar",
    "AIIMS Jodhpur",
    "JIPMER Puducherry",
    "PGIMER Chandigarh",
    "KGMU Lucknow",

    // Pure Sciences & Research
    "TIFR Mumbai",
    "NISER Bhubaneswar",
    "IISER Pune",
    "IISER Kolkata",
    "IISER Mohali",
    "IISER Bhopal",
    "IISER Tirupati",

    // Arts, Commerce, Social Sciences, Multidisciplinary
    "University of Delhi",
    "Jawaharlal Nehru University (JNU)",
    "Banaras Hindu University (BHU)",
    "Aligarh Muslim University (AMU)",
    "University of Calcutta",
    "University of Mumbai",
    "Savitribai Phule Pune University",
    "Osmania University",
    "University of Hyderabad",
    "Panjab University",
    "Jamia Millia Islamia",

    // Law
    "NLSIU Bangalore",
    "NALSAR Hyderabad",
    "NLU Delhi",
    "WBNUJS Kolkata",
    "NLU Jodhpur",

    // Design, Fashion, Architecture
    "NID Ahmedabad",
    "NID Bengaluru",
    "NIFT Delhi",
    "NIFT Mumbai",
    "SPA Delhi",

    // Agriculture & Allied
    "IARI Delhi",
    "Punjab Agricultural University",
    "GBPUAT Pantnagar",

    // Management (PG) – Public Institutions
    "IIM Ahmedabad",
    "IIM Bangalore",
    "IIM Calcutta",
    "IIM Lucknow",

    // Statistics & Data
    "ISI Kolkata",
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Your personalized learning hub. Track progress, explore opportunities, and achieve your goals.
            </p>
            
            {(!dashboardData?.progressData || dashboardData.progressData.length === 0) && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground mb-2">
                  Get started by adding some sample data to explore your dashboard
                </p>
                <Button onClick={handleSeedData} size="sm">
                  Add Sample Data
                </Button>
              </div>
            )}
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Progress Tracker */}
            <DashboardCard
              title="PROGRESS TRACKER"
              description="Track your milestones"
              icon={TrendingUp}
              onClick={() => navigate("/progress-tracker")}
            >
              <div className="space-y-3">
                {dashboardData?.progressData?.slice(0, 2).map((progress, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{progress.subject}</span>
                      <span className="text-muted-foreground">
                        {progress.currentLevel}/{progress.totalLevels}
                      </span>
                    </div>
                    <Progress 
                      value={(progress.currentLevel / progress.totalLevels) * 100} 
                      className="h-2"
                    />
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">No progress data yet</p>
                )}
              </div>
            </DashboardCard>

            {/* To Do List */}
            <DashboardCard
              title="TO DO LIST"
              description="Manage your tasks"
              icon={CheckSquare}
              onClick={() => navigate("/to-do-list")}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {dashboardData?.pendingTasks || 0}
                </div>
                <p className="text-sm text-muted-foreground">Pending tasks</p>
              </div>
            </DashboardCard>

            {/* Goals card removed */}

            {/* Scores */}
            <DashboardCard
              title="SCORES"
              description="View your academic scores"
              icon={BarChart3}
              onClick={() => navigate("/scores")}
            >
              <div className="space-y-2">
                {dashboardData?.recentScores?.slice(0, 2).map((score, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="font-medium">{score.subject}</span>
                    <span className="text-primary font-semibold">
                      {score.score}/{score.maxScore}
                    </span>
                  </div>
                )) || (
                  <p className="text-sm text-muted-foreground">No scores yet</p>
                )}
              </div>
            </DashboardCard>

            {/* Performance Graph */}
            <DashboardCard
              title="PERFORMANCE GRAPH"
              description="Visualize your performance trends"
              icon={LineChart}
            />

            {/* Career Path */}
            <DashboardCard
              title="CAREER PATH"
              description="Explore career options"
              icon={GraduationCap}
              onClick={() => navigate("/career-path")}
            >
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  {dashboardData?.user?.currentCareerGoal || "Set your career goal"}
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Recommended Colleges</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendedColleges.map((c) => (
                      <span
                        key={c}
                        className="text-xs rounded-md border bg-muted px-2 py-1"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </DashboardCard>

            {/* Scholarships */}
            <DashboardCard
              title="SCHOLARSHIPS"
              description="Find scholarships"
              icon={Trophy}
              onClick={() => navigate("/scholarships")}
            />

            {/* Study Materials */}
            <DashboardCard
              title="STUDY MATERIALS(WITH LINKS)"
              description="Access study resources"
              icon={BookOpen}
            />

            {/* Task to be Completed */}
            <DashboardCard
              title="TASK TO BE COMPLETED TO REACH GOAL"
              description="Checklist and deadlines"
              icon={ClipboardList}
            />

            {/* Career Goal */}
            <DashboardCard
              title="CAREER GOAL"
              description="Your current career objective"
              icon={Target}
            >
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => navigate("/career-goal")}>
                  Open Full View
                </Button>
              </div>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Current:</span>{" "}
                  <span className="font-medium">
                    {dashboardData?.user?.currentCareerGoal || "Not set"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., Become a Software Engineer"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                  />
                  <Button size="sm" onClick={handleSaveGoal}>
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tip: Be specific. Example: "MBBS → General Physician" or "B.Tech CSE → SDE".
                </p>
              </div>
            </DashboardCard>

            {/* Pie Chart */}
            <DashboardCard
              title="PIE CHART: WEAKNESS & FIELD TO IMPROVE"
              description="Identify areas to work on"
              icon={PieChart}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    We classify each subject by normalized score percentage: Strong Areas (≥ 80%), Needs Improvement (50–79%), Weaknesses (&lt; 50%).
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/scores")}
                  >
                    Add/Update Scores
                  </Button>
                </div>

                <Tabs defaultValue="class10" className="w-full">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="class10">Class 10</TabsTrigger>
                    <TabsTrigger value="class12">Class 12</TabsTrigger>
                  </TabsList>

                  <TabsContent value="class10">
                    <div className="h-56">
                      <ChartContainer
                        id="weakness-pie-class10"
                        config={{
                          "Strong Areas": { label: "Strong Areas", color: CATEGORY_COLORS["Strong Areas"] },
                          "Needs Improvement": { label: "Needs Improvement", color: CATEGORY_COLORS["Needs Improvement"] },
                          "Weaknesses": { label: "Weaknesses", color: CATEGORY_COLORS["Weaknesses"] },
                        }}
                        className="w-full h-full"
                      >
                        <ResponsiveContainer>
                          <RePieChart>
                            <Pie
                              data={class10Distribution}
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
                              {class10Distribution.map((entry) => (
                                <Cell key={`c10-${entry.name}`} fill={CATEGORY_COLORS[entry.name]} />
                              ))}
                            </Pie>
                            <ReTooltip
                              content={
                                <ChartTooltipContent
                                  nameKey="name"
                                  labelKey="name"
                                  indicator="dot"
                                />
                              }
                            />
                            <ReLegend />
                          </RePieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </TabsContent>

                  <TabsContent value="class12">
                    <div className="h-56">
                      <ChartContainer
                        id="weakness-pie-class12"
                        config={{
                          "Strong Areas": { label: "Strong Areas", color: CATEGORY_COLORS["Strong Areas"] },
                          "Needs Improvement": { label: "Needs Improvement", color: CATEGORY_COLORS["Needs Improvement"] },
                          "Weaknesses": { label: "Weaknesses", color: CATEGORY_COLORS["Weaknesses"] },
                        }}
                        className="w-full h-full"
                      >
                        <ResponsiveContainer>
                          <RePieChart>
                            <Pie
                              data={class12Distribution}
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
                              {class12Distribution.map((entry) => (
                                <Cell key={`c12-${entry.name}`} fill={CATEGORY_COLORS[entry.name]} />
                              ))}
                            </Pie>
                            <ReTooltip
                              content={
                                <ChartTooltipContent
                                  nameKey="name"
                                  labelKey="name"
                                  indicator="dot"
                                />
                              }
                            />
                            <ReLegend />
                          </RePieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </TabsContent>
                </Tabs>

                <p className="text-xs text-muted-foreground">
                  Recommendation: Focus more on your weak areas for better stream readiness.
                </p>
              </div>
            </DashboardCard>

            {/* Advice */}
            <DashboardCard
              title="ADVICE FOR BETTERMENT & IMPROVEMENT"
              description="Personalized guidance"
              icon={Lightbulb}
            />

            {/* Aptitude Test */}
            <DashboardCard
              title="APTITUDE TEST"
              description="Assess your strengths"
              icon={Award}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {aptitudeScore !== null ? (
                    <span>
                      Last Score: <span className="font-medium">{aptitudeScore}/20</span> •{" "}
                      <span className="font-medium">
                        {aptitudeScore <= 7 ? "Beginner" : aptitudeScore <= 14 ? "Intermediate" : "Strong Aptitude"}
                      </span>
                    </span>
                  ) : (
                    <span>Answer 20 questions. Each correct answer = 1 point. Score shown out of 20.</span>
                  )}
                </div>
                <Button size="sm" onClick={() => navigate("/aptitude-test")}>
                  Open Test
                </Button>
              </div>
            </DashboardCard>

            {/* Personal Interests & HOBBIES */}
            <DashboardCard
              title="PERSONAL INTERESTS & HOBBIES"
              description="Manage your interests and hobbies"
              icon={Heart}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {result ? (
                    <span>
                      Primary Field: <span className="font-medium">{result.recommended}</span> •
                      Scores — S: {result.science}, C: {result.commerce}, A: {result.arts}
                    </span>
                  ) : (
                    <span>Take a quick questionnaire to get a recommended stream.</span>
                  )}
                </div>
                <Button size="sm" onClick={() => navigate("/personal-interests")}>
                  Open Questionnaire
                </Button>
              </div>
            </DashboardCard>

            {/* Interests & Hobbies Modal */}
            <Dialog open={interestsOpen} onOpenChange={setInterestsOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Interests & Hobbies Questionnaire</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Instructions: Choose one option per question. Your answers will help us recommend whether your interest is in Science, Commerce, or Arts.
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Scoring Rule: Each selected option adds 1 point to the respective stream. The stream with the highest score becomes your recommended interest area.
                  </p>

                  <div className="grid gap-4">
                    {QUESTIONS.map((q, idx) => (
                      <div key={idx} className="rounded-md border p-3">
                        <p className="text-sm font-medium mb-2">
                          {idx + 1}. {q}
                        </p>
                        <RadioGroup
                          value={answers[idx] ?? undefined}
                          onValueChange={(v) =>
                            setAnswers((prev) => ({ ...prev, [idx]: v as "Science" | "Commerce" | "Arts" }))
                          }
                          className="grid sm:grid-cols-3 gap-2"
                        >
                          <label className="flex items-center gap-2 rounded-md border p-2">
                            <RadioGroupItem value="Science" />
                            <span className="text-sm">option a</span>
                          </label>
                          <label className="flex items-center gap-2 rounded-md border p-2">
                            <RadioGroupItem value="Commerce" />
                            <span className="text-sm">option b</span>
                          </label>
                          <label className="flex items-center gap-2 rounded-md border p-2">
                            <RadioGroupItem value="Arts" />
                            <span className="text-sm">option c</span>
                          </label>
                        </RadioGroup>
                      </div>
                    ))}
                  </div>

                  {/* Output */}
                  {result && (
                    <div className="rounded-md border p-3 text-sm">
                      <p className="font-medium mb-1">Result</p>
                      <p>• Science: {result.science} points</p>
                      <p>• Commerce: {result.commerce} points</p>
                      <p>• Arts: {result.arts} points</p>
                      <p className="mt-2">
                        Recommendation: <span className="font-semibold">Primary Field: {result.recommended}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Suggested Courses: {result.recommended === "Science" ? "B.Sc., B.Tech, MBBS" : result.recommended === "Commerce" ? "B.Com, BBA, CA/CS/CMA" : "BA, B.Des, BJMC"} •
                        Career Paths: {result.recommended === "Science" ? "Engineer, Doctor, Scientist, Data Analyst" : result.recommended === "Commerce" ? "Entrepreneur, Banker, Accountant" : "Writer, Journalist, Designer"}
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter className="flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetInterests}>Reset</Button>
                    <Button onClick={submitInterests}>Submit</Button>
                  </div>
                  <Button onClick={saveInterestsRecommendation} variant="default">
                    Save Recommendation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* ADD: Aptitude Test Modal */}
            <Dialog open={aptitudeOpen} onOpenChange={setAptitudeOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Aptitude Test</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Instructions for User: Answer the following 20 aptitude questions. Each correct answer gives you 1 point.
                    At the end, your score will be shown out of 20.
                  </p>

                  {/* Questions */}
                  <div className="grid gap-4">
                    {APTITUDE_QUESTIONS.map((item, idx) => (
                      <div key={idx} className="rounded-md border p-3">
                        <p className="text-sm font-medium mb-2">{item.q}</p>
                        <RadioGroup
                          value={
                            aptitudeAnswers[idx] === null || aptitudeAnswers[idx] === undefined
                              ? undefined
                              : String(aptitudeAnswers[idx])
                          }
                          onValueChange={(v) =>
                            setAptitudeAnswers((prev) => ({
                              ...prev,
                              [idx]: Number(v),
                            }))
                          }
                          className="grid sm:grid-cols-2 gap-2"
                        >
                          {item.options.map((opt, i) => (
                            <label key={i} className="flex items-center gap-2 rounded-md border p-2">
                              <RadioGroupItem value={String(i)} />
                              <span className="text-sm">{opt}</span>
                            </label>
                          ))}
                        </RadioGroup>
                      </div>
                    ))}
                  </div>

                  {/* Result */}
                  {aptitudeScore !== null && (
                    <div className="rounded-md border p-3 text-sm">
                      <p className="font-medium mb-1">Result</p>
                      <p>
                        Score: <span className="font-semibold">{aptitudeScore}/20</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Level:{" "}
                        {aptitudeScore <= 7 ? "Beginner" : aptitudeScore <= 14 ? "Intermediate" : "Strong Aptitude"}
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter className="flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={resetAptitude}>Reset</Button>
                    <Button onClick={submitAptitude}>Submit</Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Add: College Admin Vacant Seats */}
            {isCollege && (
              <DashboardCard
                title="VACANT SEATS (ADMIN)"
                description="Publish seats by branch"
                icon={ClipboardList}
              >
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-muted-foreground">
                    Add entries visible to students in real-time
                  </p>
                  <Button size="sm" onClick={() => setSeatDialogOpen(true)}>
                    Add Entry
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-auto pr-1">
                  {(mySeats ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No entries yet</p>
                  ) : (
                    (mySeats ?? []).slice(0, 5).map((s) => {
                      const closed = s.lastDate < Date.now();
                      return (
                        <div key={s._id} className="text-sm rounded-md border p-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{s.branch}</span>
                            <span className={`text-xs ${closed ? "text-red-500" : "text-green-600"}`}>
                              {closed ? "Closed" : "Open"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{s.collegeName}</p>
                          <div className="flex justify-between text-xs mt-1">
                            <span>Seats: {s.seats}</span>
                            <span>
                              Last Date: {new Date(s.lastDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Dialog for creating entry */}
                <Dialog open={seatDialogOpen} onOpenChange={setSeatDialogOpen}>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add Vacant Seats</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">College Name</label>
                        <Input
                          value={vsCollegeName}
                          onChange={(e) => setVsCollegeName(e.target.value)}
                          placeholder="XYZ Institute of Technology"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Branch/Department</label>
                        <Input
                          value={vsBranch}
                          onChange={(e) => setVsBranch(e.target.value)}
                          placeholder="Computer Science, Mechanical, Commerce, Arts..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Vacant Seats</label>
                          <Input
                            inputMode="numeric"
                            value={vsSeats}
                            onChange={(e) =>
                              setVsSeats(e.target.value.replace(/[^\d]/g, ""))
                            }
                            placeholder="12"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Last Date (DD/MM/YYYY)</label>
                          <Input
                            value={vsLastDate}
                            onChange={(e) => setVsLastDate(e.target.value)}
                            placeholder="30/09/2025"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Additional Notes (optional)</label>
                        <Textarea
                          value={vsNotes}
                          onChange={(e) => setVsNotes(e.target.value)}
                          placeholder="Reservation details, eligibility, counseling rounds..."
                        />
                      </div>
                    </div>

                    <DialogFooter className="flex justify-end">
                      <Button variant="outline" onClick={() => setSeatDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateSeat}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DashboardCard>
            )}

            {/* Add: Student-facing available seats */}
            {!isCollege && (
              <DashboardCard
                title="AVAILABLE COLLEGE SEATS"
                description="Open seats and deadlines"
                icon={GraduationCap}
              >
                <div className="space-y-2 max-h-48 overflow-auto pr-1">
                  {(openSeats ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No open seats right now</p>
                  ) : (
                    (openSeats ?? []).slice(0, 6).map((s) => (
                      <div key={s._id} className="text-sm rounded-md border p-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{s.branch}</span>
                          <span className="text-xs text-green-600">Open</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{s.collegeName}</p>
                        <div className="flex justify-between text-xs mt-1">
                          <span>Seats: {s.seats}</span>
                          <span>Apply by: {new Date(s.lastDate).toLocaleDateString()}</span>
                        </div>
                        {s.notes && (
                          <p className="text-[11px] text-muted-foreground mt-1">
                            {s.notes}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </DashboardCard>
            )}

            {/* Government Colleges */}
            <DashboardCard
              title="GOVERNMENT COLLEGES"
              description="Explore top government institutions"
              icon={GraduationCap}
              onClick={() => window.open("/career-path", "_blank", "noopener,noreferrer")}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pr-1">
                  {GOV_COLLEGES.map((c) => (
                    <span
                      key={c}
                      className="text-xs rounded-md border bg-muted px-2 py-1"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={() => window.open("/career-path", "_blank", "noopener,noreferrer")}>
                    Government Colleges
                  </Button>
                </div>
              </div>
            </DashboardCard>
          </div>
        </motion.div>
      </main>
    </div>
  );
}