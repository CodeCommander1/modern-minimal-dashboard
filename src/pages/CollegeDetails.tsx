import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GraduationCap, MapPin, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router";
import { useMemo } from "react";

type CollegeInfo = {
  name: string;
  stream: "Engineering & Tech" | "Medical & Health Sciences" | "Pure Sciences & Research" | "Arts/Commerce/Sciences" | "Law" | "Design/Fashion/Architecture" | "Agriculture & Allied" | "Management" | "Statistics & Data" | "Multidisciplinary";
  location?: string;
  highlight?: string;
  programs: Array<string>;
  entranceExams?: Array<string>;
  website?: string;
};

// Minimal dataset covering the listed colleges on the Dashboard.
// You can extend this record easily later.
const COLLEGE_DETAILS: Record<string, CollegeInfo> = {
  "iisc-bangalore": {
    name: "IISc Bangalore",
    stream: "Pure Sciences & Research",
    location: "Bengaluru, Karnataka",
    highlight: "Premier institute for advanced scientific and engineering research.",
    programs: ["BTech", "BS (Research)", "MTech", "MSc", "PhD"],
    entranceExams: ["JEE (Adv)", "NEET (for select biosciences pathways)", "GATE", "JAM"],
    website: "https://iisc.ac.in/",
  },
  "iit-bombay": {
    name: "IIT Bombay",
    stream: "Engineering & Tech",
    location: "Mumbai, Maharashtra",
    highlight: "Top-ranked engineering and research institute.",
    programs: ["BTech", "Dual Degree", "MTech", "MS", "PhD"],
    entranceExams: ["JEE (Adv)", "GATE", "CEED (Design)"],
    website: "https://www.iitb.ac.in/",
  },
  "iit-delhi": {
    name: "IIT Delhi",
    stream: "Engineering & Tech",
    location: "New Delhi",
    programs: ["BTech", "Dual Degree", "MTech", "MS", "PhD"],
    entranceExams: ["JEE (Adv)", "GATE"],
    website: "https://home.iitd.ac.in/",
  },
  "iit-madras": {
    name: "IIT Madras",
    stream: "Engineering & Tech",
    location: "Chennai, Tamil Nadu",
    programs: ["BTech", "Dual Degree", "MTech", "MS", "PhD"],
    entranceExams: ["JEE (Adv)", "GATE"],
    website: "https://www.iitm.ac.in/",
  },
  "iit-kanpur": {
    name: "IIT Kanpur",
    stream: "Engineering & Tech",
    location: "Kanpur, Uttar Pradesh",
    programs: ["BTech", "Dual Degree", "MTech", "MS", "PhD"],
    entranceExams: ["JEE (Adv)", "GATE"],
    website: "https://www.iitk.ac.in/",
  },
  "iit-kharagpur": {
    name: "IIT Kharagpur",
    stream: "Engineering & Tech",
    location: "Kharagpur, West Bengal",
    programs: ["BTech", "Dual Degree", "MTech", "MS", "PhD"],
    entranceExams: ["JEE (Adv)", "GATE"],
    website: "https://www.iitkgp.ac.in/",
  },
  "iit-roorkee": {
    name: "IIT Roorkee",
    stream: "Engineering & Tech",
    location: "Roorkee, Uttarakhand",
    programs: ["BTech", "Dual Degree", "MTech", "MS", "PhD"],
    entranceExams: ["JEE (Adv)", "GATE"],
    website: "https://www.iitr.ac.in/",
  },
  "iit-guwahati": {
    name: "IIT Guwahati",
    stream: "Engineering & Tech",
    location: "Guwahati, Assam",
    programs: ["BTech", "Dual Degree", "MTech", "MS", "PhD"],
    entranceExams: ["JEE (Adv)", "GATE"],
    website: "https://www.iitg.ac.in/",
  },
  "aiims-delhi": {
    name: "AIIMS Delhi",
    stream: "Medical & Health Sciences",
    location: "New Delhi",
    highlight: "Top medical institute and hospital.",
    programs: ["MBBS", "BSc (Nursing)", "MD/MS", "DM/MCh"],
    entranceExams: ["NEET-UG", "INICET (PG)"],
    website: "https://www.aiims.edu/en.html",
  },
  "cmc-vellore": {
    name: "CMC Vellore",
    stream: "Medical & Health Sciences",
    location: "Vellore, Tamil Nadu",
    programs: ["MBBS", "BSc (Nursing)", "MD/MS"],
    entranceExams: ["NEET-UG (MBBS)", "Institution-specific processes for allied/PG"],
    website: "https://www.cmch-vellore.edu/",
  },
  "jipmer-puducherry": {
    name: "JIPMER Puducherry",
    stream: "Medical & Health Sciences",
    location: "Puducherry",
    programs: ["MBBS", "MD/MS", "BSc (Allied)"],
    entranceExams: ["NEET-UG (MBBS)", "INICET (PG)"],
    website: "https://jipmer.edu.in/",
  },
  "nlusiu-bangalore": {
    name: "NLSIU Bangalore",
    stream: "Law",
    location: "Bengaluru, Karnataka",
    programs: ["BA LL.B", "LL.M", "Masters", "PhD"],
    entranceExams: ["CLAT"],
    website: "https://www.nls.ac.in/",
  },
  "nalsar-hyderabad": {
    name: "NALSAR Hyderabad",
    stream: "Law",
    location: "Hyderabad, Telangana",
    programs: ["BA LL.B", "LL.M", "PhD"],
    entranceExams: ["CLAT"],
    website: "https://www.nalsar.ac.in/",
  },
  "nlu-delhi": {
    name: "NLU Delhi",
    stream: "Law",
    location: "New Delhi",
    programs: ["BA LL.B", "LL.M", "PhD"],
    entranceExams: ["AILET"],
    website: "https://nludelhi.ac.in/",
  },
  "nid-ahmedabad": {
    name: "NID Ahmedabad",
    stream: "Design/Fashion/Architecture",
    location: "Ahmedabad, Gujarat",
    programs: ["B.Des", "M.Des", "PhD"],
    entranceExams: ["NID DAT"],
    website: "https://www.nid.edu/",
  },
  "nift-delhi": {
    name: "NIFT Delhi",
    stream: "Design/Fashion/Architecture",
    location: "New Delhi",
    programs: ["B.Des", "B.FTech", "MFM", "M.Des", "M.FTech"],
    entranceExams: ["NIFT Entrance Exam"],
    website: "https://www.nift.ac.in/delhi/",
  },
  "spa-delhi": {
    name: "SPA Delhi",
    stream: "Design/Fashion/Architecture",
    location: "New Delhi",
    programs: ["B.Arch", "B.Plan", "M.Arch", "M.Plan"],
    entranceExams: ["JEE Main (B.Arch/B.Plan)", "GATE (PG)"],
    website: "http://spa.ac.in/",
  },
  "iim-ahmedabad": {
    name: "IIM Ahmedabad",
    stream: "Management",
    location: "Ahmedabad, Gujarat",
    programs: ["MBA/PGP", "PhD"],
    entranceExams: ["CAT"],
    website: "https://www.iima.ac.in/",
  },
  "iim-bangalore": {
    name: "IIM Bangalore",
    stream: "Management",
    location: "Bengaluru, Karnataka",
    programs: ["MBA/PGP", "PhD"],
    entranceExams: ["CAT"],
    website: "https://www.iimb.ac.in/",
  },
  "iim-calcutta": {
    name: "IIM Calcutta",
    stream: "Management",
    location: "Kolkata, West Bengal",
    programs: ["MBA/PGP", "PhD"],
    entranceExams: ["CAT"],
    website: "https://www.iimcal.ac.in/",
  },
  "isi-kolkata": {
    name: "ISI Kolkata",
    stream: "Statistics & Data",
    location: "Kolkata, West Bengal",
    programs: ["B.Stat", "B.Math", "M.Stat", "M.Math", "MS (QMS)"],
    entranceExams: ["ISI Admission Test"],
    website: "https://www.isical.ac.in/",
  },
  "du-delhi": {
    name: "University of Delhi",
    stream: "Arts/Commerce/Sciences",
    location: "New Delhi",
    programs: ["BA", "BSc", "BCom", "BMS", "MA/MSc/MCom"],
    entranceExams: ["CUET-UG/PG (most)"],
    website: "https://www.du.ac.in/",
  },
  "jnu-delhi": {
    name: "Jawaharlal Nehru University (JNU)",
    stream: "Arts/Commerce/Sciences",
    location: "New Delhi",
    programs: ["BA Hons (Lang)", "MA/MS/PhD (various)"],
    entranceExams: ["CUET (UG/PG as applicable)"],
    website: "https://www.jnu.ac.in/",
  },
};

function titleCase(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function CollegeDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const slug = (params.slug || "").toLowerCase();

  const info = useMemo<CollegeInfo | null>(() => {
    if (COLLEGE_DETAILS[slug]) return COLLEGE_DETAILS[slug];
    // Fallback display when a slug isn't in our map
    return {
      name: titleCase(slug || "Unknown College"),
      stream: "Multidisciplinary",
      programs: ["UG Programs", "PG Programs"],
      highlight: "Details coming soon. Explore general information and programs.",
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-8 py-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{info?.name}</h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/government-colleges")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                {info?.highlight && <p className="text-muted-foreground">{info.highlight}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground mb-1">Stream</p>
                    <p className="font-medium">{info?.stream}</p>
                  </div>
                  {info?.location && (
                    <div className="rounded-md border p-3">
                      <p className="text-xs text-muted-foreground mb-1">Location</p>
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {info.location}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Popular Programs</p>
                  <div className="flex flex-wrap gap-2">
                    {(info?.programs ?? []).map((p) => (
                      <span key={p} className="text-[11px] rounded-md border bg-muted px-2 py-1">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {info?.entranceExams && info.entranceExams.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Entrance Exams</p>
                    <div className="flex flex-wrap gap-2">
                      {info.entranceExams.map((e) => (
                        <span key={e} className="text-[11px] rounded-md border bg-muted px-2 py-1">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Official Website</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => info?.website && window.open(info.website, "_blank", "noopener,noreferrer")}
                    disabled={!info?.website}
                  >
                    Open
                  </Button>
                </div>
                <div className="rounded-md border p-3 text-xs text-muted-foreground">
                  Tip: Verify program details, deadlines, and eligibility on the official website.
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
