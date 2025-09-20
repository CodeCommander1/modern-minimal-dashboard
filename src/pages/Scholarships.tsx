import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router";

type ScholarshipItem = {
  _id?: string;
  title: string;
  description: string;
  amount?: number;
  deadline?: number;
  eligibility?: Array<string>;
  applicationUrl: string;
  category?: string;
};

// Fallback items shown if DB has none yet
const FALLBACK: Array<ScholarshipItem> = [
  {
    title: "National Scholarship Portal (NSP)",
    description: "Centralized portal for numerous Indian government scholarships across categories.",
    applicationUrl: "https://scholarships.gov.in/",
  },
  {
    title: "AICTE Pragati Scholarship",
    description: "For girl students pursuing technical education (AICTE approved institutions).",
    applicationUrl: "https://www.aicte-india.org/schemes/students-development-schemes/Pragati",
  },
  {
    title: "Inspire Scholarship (SHE)",
    description: "Department of Science & Technology scholarship for top science students.",
    applicationUrl: "https://online-inspire.gov.in/",
  },
  {
    title: "Jindal Scholarship",
    description: "Merit-cum-means scholarship for undergraduate students across disciplines.",
    applicationUrl: "https://www.sitaramjindalfoundation.org/scholarships",
  },
  {
    title: "Fulbright-Nehru Fellowships",
    description: "For outstanding Indians to pursue master’s/doctoral study in the U.S.",
    applicationUrl: "https://www.usief.org.in/Fellowships/Fellowships-for-Indian-Citizens.aspx",
  },
];

function formatAmount(amount?: number) {
  if (amount === undefined) return "—";
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakh`;
  return `₹${amount.toLocaleString()}`;
}

function formatDate(deadline?: number) {
  return deadline ? new Date(deadline).toLocaleDateString() : "—";
}

export default function Scholarships() {
  const navigate = useNavigate();
  const data = useQuery(api.dashboard.getScholarships) as Array<ScholarshipItem> | undefined;
  const items: Array<ScholarshipItem> = data && data.length > 0 ? data : FALLBACK;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Scholarships</h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Find and Apply</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Explore scholarships with direct application links. Always verify eligibility, deadlines, and official guidelines on the provider’s site.
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((s, idx) => (
              <Card key={s._id ?? `fallback-${idx}`} className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{s.description}</p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">{formatAmount(s.amount)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground">Deadline</p>
                      <p className="font-medium">{formatDate(s.deadline)}</p>
                    </div>
                  </div>

                  {s.eligibility && s.eligibility.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Eligibility</p>
                      <div className="flex flex-wrap gap-2">
                        {s.eligibility.map((e) => (
                          <span key={e} className="text-[10px] rounded-md border bg-muted px-2 py-1">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-1">
                    <a
                      href={s.applicationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                      Apply / Learn More
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
