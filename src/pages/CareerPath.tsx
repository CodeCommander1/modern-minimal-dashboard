import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState } from "react";

type StreamKey = "Science" | "Commerce" | "Arts";

type Career = {
  stream: StreamKey;
  title: string;
  avg: number; // average score %
  duration: string; // e.g., "4 years"
  subjects: Array<string>;
  jobs: Array<string>;
  colleges: Array<string>;
};

// Add career data covering Science, Commerce, Arts
const CAREERS: Array<Career> = [
  // Science
  { stream: "Science", title: "Engineer (Computer Science)", avg: 85, duration: "4 years", subjects: ["Mathematics", "Physics", "Chemistry"], jobs: ["Software Engineer", "SDE", "Systems Engineer"], colleges: ["IITs", "NITs", "IIITs"] },
  { stream: "Science", title: "Engineer (Electrical)", avg: 82, duration: "4 years", subjects: ["Mathematics", "Physics", "Chemistry"], jobs: ["Electrical Engineer", "Power Systems Engineer"], colleges: ["IITs", "NITs", "IIITs"] },
  { stream: "Science", title: "Engineer (Mechanical)", avg: 80, duration: "4 years", subjects: ["Mathematics", "Physics", "Chemistry"], jobs: ["Mechanical Engineer", "Design Engineer"], colleges: ["IITs", "NITs", "State Technical Universities"] },
  { stream: "Science", title: "Civil Engineering (B.Tech/B.E.)", avg: 78, duration: "4 years", subjects: ["Mathematics", "Physics", "Chemistry"], jobs: ["Civil Engineer", "Structural Engineer"], colleges: ["IITs", "NITs", "BITS"] },
  { stream: "Science", title: "Data Science (B.Sc/B.Tech)", avg: 85, duration: "3-4 years", subjects: ["Mathematics", "Computer Science (preferred)"], jobs: ["Data Analyst", "Data Scientist"], colleges: ["IITs", "IIITs", "Private Universities"] },
  { stream: "Science", title: "Doctor (MBBS)", avg: 90, duration: "5.5 years", subjects: ["Biology", "Chemistry", "Physics", "English"], jobs: ["General Physician", "Surgeon", "Resident Doctor"], colleges: ["AIIMS", "CMC Vellore", "JIPMER"] },
  { stream: "Science", title: "Architecture (B.Arch)", avg: 80, duration: "5 years", subjects: ["Mathematics", "Physics", "Chemistry"], jobs: ["Architect", "Urban Planner"], colleges: ["SPA Delhi", "IIT Roorkee", "CEPT"] },
  { stream: "Science", title: "Aviation (Commercial Pilot)", avg: 75, duration: "18-24 months", subjects: ["Mathematics", "Physics", "English"], jobs: ["Airline Pilot", "Flight Instructor"], colleges: ["Indigo Cadet Program", "IGRUA"] },
  { stream: "Science", title: "Biotechnology (B.Tech/B.Sc)", avg: 78, duration: "3-4 years", subjects: ["Biology", "Chemistry", "Physics", "Mathematics (optional)"], jobs: ["Biotech Associate", "Lab Scientist"], colleges: ["IITs", "IIT", "Amity"] },
  { stream: "Science", title: "Nursing (B.Sc)", avg: 75, duration: "4 years", subjects: ["Biology", "Chemistry", "Physics"], jobs: ["Staff Nurse", "Clinical Nurse Specialist"], colleges: ["AIIMS", "PGIMER", "State Medical Colleges"] },
  { stream: "Science", title: "Pharmacy (B.Pharm)", avg: 75, duration: "4 years", subjects: ["Biology", "Chemistry", "Physics/Mathematics"], jobs: ["Pharmacist", "Drug Safety Associate"], colleges: ["NIPER", "Jamia Hamdard"] },
  { stream: "Science", title: "Forensic Science (B.Sc)", avg: 75, duration: "3 years", subjects: ["Biology", "Chemistry", "Physics"], jobs: ["Forensic Analyst", "Lab Technician"], colleges: ["GFSU", "Delhi University"] },
  { stream: "Science", title: "Statistics (B.Sc)", avg: 80, duration: "3 years", subjects: ["Mathematics", "English"], jobs: ["Statistician", "Data Analyst"], colleges: ["ISI", "DU", "IISER (related)"] },

  // Commerce
  { stream: "Commerce", title: "B.Com (Finance/Accounting)", avg: 70, duration: "3 years", subjects: ["Accounting", "Economics", "Business Studies"], jobs: ["Accountant", "Financial Analyst"], colleges: ["SRCC", "Loyola", "Christ University"] },
  { stream: "Commerce", title: "BA (Economics)", avg: 75, duration: "3 years", subjects: ["Economics", "Mathematics (preferred)"], jobs: ["Economist (entry)", "Research Associate"], colleges: ["Delhi School of Economics", "St. Xavier's"] },
  { stream: "Commerce", title: "Banking & Insurance", avg: 70, duration: "3 years", subjects: ["Mathematics", "Economics (preferred)"], jobs: ["Bank PO", "Insurance Associate"], colleges: ["Public Universities", "Private Colleges"] },
  { stream: "Commerce", title: "BBA (Management)", avg: 70, duration: "3 years", subjects: ["English", "Mathematics (preferred)"], jobs: ["Business Analyst", "Operations Executive"], colleges: ["NMIMS", "Christ University", "IPU Colleges"] },
  { stream: "Commerce", title: "Chartered Accountant (CA)", avg: 80, duration: "3-5 years (with articleship)", subjects: ["Accounting", "Business Studies", "Mathematics (preferred)"], jobs: ["Auditor", "Tax Consultant", "Finance Manager"], colleges: ["ICAI (professional route)"] },
  { stream: "Commerce", title: "Company Secretary (CS)", avg: 75, duration: "3-4 years", subjects: ["Business Studies", "Accounting"], jobs: ["Company Secretary", "Compliance Officer"], colleges: ["ICSI (professional route)"] },
  { stream: "Commerce", title: "Cost & Management Accountant (CMA)", avg: 75, duration: "3-4 years", subjects: ["Accounting", "Mathematics (preferred)"], jobs: ["Cost Accountant", "FP&A Analyst"], colleges: ["ICMAI (professional route)"] },
  { stream: "Commerce", title: "Investment Banking (PG after B.Com/BBA)", avg: 85, duration: "5+ years (UG+PG/Certs)", subjects: ["Mathematics", "Accounting"], jobs: ["Analyst", "Associate"], colleges: ["Top MBA Schools", "CFA Route"] },
  { stream: "Commerce", title: "Logistics & Supply Chain", avg: 70, duration: "3-4 years", subjects: ["Mathematics", "Business Studies"], jobs: ["Supply Chain Analyst", "Operations Manager"], colleges: ["IIMs (PG)", "UG programs in many universities"] },
  { stream: "Commerce", title: "Hotel Management (BHM)", avg: 65, duration: "3-4 years", subjects: ["English", "Any Stream"], jobs: ["Front Office", "F&B Manager"], colleges: ["IHM Institutes", "Private Hospitality Schools"] },

  // Arts
  { stream: "Arts", title: "Design (B.Des)", avg: 75, duration: "4 years", subjects: ["Any Stream", "Aptitude for design"], jobs: ["UI/UX Designer", "Product Designer"], colleges: ["NID", "IIT IDC", "Pearl Academy"] },
  { stream: "Arts", title: "Education (B.Ed after UG)", avg: 70, duration: "2 years (after UG)", subjects: ["Any UG Degree"], jobs: ["Teacher", "Academic Coordinator"], colleges: ["DU", "State Universities"] },
  { stream: "Arts", title: "Fine Arts (BFA)", avg: 65, duration: "4 years", subjects: ["Any Stream", "Portfolio preferred"], jobs: ["Artist", "Art Director (entry)"], colleges: ["JJ School of Art", "DU Colleges"] },
  { stream: "Arts", title: "Foreign Languages", avg: 65, duration: "1-3 years", subjects: ["Any Stream", "English"], jobs: ["Translator", "Interpreter"], colleges: ["JNU (CSE)", "DU", "Private Institutes"] },
  { stream: "Arts", title: "History (BA)", avg: 65, duration: "3 years", subjects: ["Any Stream", "English"], jobs: ["Archivist (entry)", "Educator"], colleges: ["DU", "AMU", "Public Universities"] },
  { stream: "Arts", title: "Journalism & Mass Communication", avg: 70, duration: "3 years", subjects: ["English", "Any Stream"], jobs: ["Journalist", "Content Strategist"], colleges: ["IIMC", "Symbiosis", "DU"] },
  { stream: "Arts", title: "Law (BA LL.B)", avg: 80, duration: "5 years", subjects: ["Any Stream"], jobs: ["Corporate Lawyer", "Litigation Associate"], colleges: ["NLUs", "Symbiosis Law"] },
  { stream: "Arts", title: "Political Science (BA)", avg: 68, duration: "3 years", subjects: ["English", "Any Stream"], jobs: ["Policy Intern", "Research Associate"], colleges: ["DU", "JNU (PG)", "Public Universities"] },
  { stream: "Arts", title: "Psychology (BA/B.Sc)", avg: 75, duration: "3 years", subjects: ["Psychology (preferred)", "English"], jobs: ["Counselor (entry)", "HR Associate"], colleges: ["DU", "Christ University"] },
  { stream: "Arts", title: "Social Work (BSW)", avg: 65, duration: "3 years", subjects: ["Any Stream", "English"], jobs: ["NGO Worker", "Program Associate"], colleges: ["TISS (PG focus)", "Public Universities"] },
];

// Small inline card component
function CareerCard({ c }: { c: Career }) {
  return (
    <Card className="border">
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold">{c.title}</p>
            <div className="mt-1 text-xs text-muted-foreground">
              Avg. Score: {c.avg}% • Duration: {c.duration}
            </div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-md border bg-muted">{c.stream}</span>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Required Subjects</p>
          <div className="flex flex-wrap gap-2">
            {c.subjects.map((s) => (
              <span key={s} className="text-[10px] rounded-md border bg-muted px-2 py-1">{s}</span>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Job Prospects</p>
          <div className="flex flex-wrap gap-2">
            {c.jobs.map((j) => (
              <span key={j} className="text-[10px] rounded-md border bg-muted px-2 py-1">{j}</span>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Recommended Colleges</p>
          <div className="flex flex-wrap gap-2">
            {c.colleges.map((col) => (
              <span key={col} className="text-[10px] rounded-md border bg-muted px-2 py-1">{col}</span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

  const [category, setCategory] = useState<"All" | StreamKey>("All");
  const [query, setQuery] = useState("");

  function getRecommendedColleges(goal: string): Array<string> {
    const key = Object.keys(collegesMap).find((k) =>
      goal.toLowerCase().includes(k.toLowerCase()),
    );
    return key ? collegesMap[key] : ["DU", "State Universities", "Private Colleges"];
  }

  const recommendedColleges = getRecommendedColleges(currentGoal);

  const filteredCareers = useMemo(() => {
    const byCat = category === "All" ? CAREERS : CAREERS.filter((c) => c.stream === category);
    if (!query.trim()) return byCat;
    const q = query.toLowerCase();
    return byCat.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subjects.some((s) => s.toLowerCase().includes(q)) ||
        c.jobs.some((j) => j.toLowerCase().includes(q)) ||
        c.colleges.some((col) => col.toLowerCase().includes(q)),
    );
  }, [category, query]);

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

          {/* Explore Careers Section */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Explore Careers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  {(["All", "Science", "Commerce", "Arts"] as const).map((cat) => (
                    <Button
                      key={cat}
                      variant={category === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategory(cat)}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
                <div className="ml-auto w-full sm:w-80">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by title, subject, college, or prospect..."
                    className="bg-muted/50 border-0 focus-visible:ring-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCareers.map((c) => (
                  <CareerCard key={`${c.title}-${c.stream}`} c={c} />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}