import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function CareerPath() {
  const navigate = useNavigate();
  const dashboardData = useQuery(api.dashboard.getDashboardOverview);
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
    Logistics: ["IIMs (PG)", "University Programs"],
    BBA: ["NMIMS", "Christ University", "IPU Colleges"],
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Career Path</h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Career Objective</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  Current Goal: <span className="font-medium">{currentGoal || "Not set"}</span>
                </p>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Recommended Colleges</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendedColleges.map((c) => (
                      <span key={c} className="text-xs rounded-md border bg-muted px-2 py-1">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommendations are indicative. Explore entrance requirements and cutoffs for accurate planning.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Shortlist 3–5 colleges and review eligibility.</p>
                <p>• Mark application deadlines in your To-Do List.</p>
                <p>• Align subjects and test prep with target colleges.</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
