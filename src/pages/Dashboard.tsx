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
import { useEffect } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const dashboardData = useQuery(api.dashboard.getDashboardOverview);
  const seedData = useMutation(api.seedData.seedDashboardData);

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
            />

            {/* Pie Chart */}
            <DashboardCard
              title="PIE CHART: WEAKNESS & FIELD TO IMPROVE"
              description="Identify areas to work on"
              icon={PieChart}
            />

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
            />

            {/* Personal Interests */}
            <DashboardCard
              title="PERSONAL INTERESTS & HOBBIES"
              description="Manage your interests and hobbies"
              icon={Heart}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}