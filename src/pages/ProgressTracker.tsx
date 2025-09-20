import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";
import { useNavigate } from "react-router";

type StreamKey = "Science" | "Commerce" | "Arts";

const streamScores: Record<StreamKey, { interest: number; academic: number }> = {
  Science: { interest: 0, academic: 0 },
  Commerce: { interest: 0, academic: 0 },
  Arts: { interest: 0, academic: 0 },
};

const recommendations: Record<StreamKey, { title: string; bullets: string[] }> = {
  Science: {
    title: "Science may not be the best fit right now",
    bullets: [
      "Consider exploring other streams where scores/interests are higher",
      "Review other streams where scores/interests are higher",
      "Experiment with beginner-friendly resources",
      "Talk to a mentor or counselor for alignment",
    ],
  },
  Commerce: {
    title: "Commerce may not be the best fit right now",
    bullets: [
      "Consider exploring other streams with stronger alignment to your interests and strengths.",
      "Review other streams where scores/interests are higher",
      "Experiment with beginner-friendly resources",
      "Talk to a mentor or counselor for alignment",
    ],
  },
  Arts: {
    title: "Arts may not be the best fit right now",
    bullets: [
      "Consider exploring other streams with stronger alignment to your interests and strengths.",
      "Review other streams where scores/interests are higher",
      "Experiment with beginner-friendly resources",
      "Talk to a mentor or counselor for alignment",
    ],
  },
};

const studyLinks: Record<StreamKey, Array<{ label: string; href: string }>> = {
  Science: [
    { label: "NCERT Science Basics (Class 10)", href: "https://ncert.nic.in/textbook.php" },
    { label: "Physics Fundamentals (Khan Academy)", href: "https://www.khanacademy.org/science/physics" },
    { label: "Chemistry Numericals Practice", href: "https://www.toppr.com/guides/chemistry/" },
    { label: "Maths Problem Solving", href: "https://brilliant.org/practice/" },
  ],
  Commerce: [
    { label: "Accounting Basics", href: "https://www.accountingcoach.com/" },
    { label: "Economic Essentials", href: "https://www.khanacademy.org/economics-finance-domain/microeconomics" },
    { label: "Stock Market Simulators", href: "https://www.investopedia.com/simulator/" },
  ],
  Arts: [
    { label: "Creative Writing Guide", href: "https://www.masterclass.com/articles/how-to-write" },
    { label: "Art & Design Resources", href: "https://www.canva.com/learn/" },
    { label: "History & Civics (OpenStax)", href: "https://openstax.org/subjects/social-sciences" },
  ],
};

function StreamRow({ name, interest, academic }: { name: StreamKey; interest: number; academic: number }) {
  const finalScore = Math.round((interest + academic) / 2);
  return (
    <Card className="border">
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium">{name}</p>
          <span className="text-xs text-muted-foreground">Final: {finalScore}%</span>
        </div>
        <div className="grid gap-3">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Interest: {interest}%</span>
            </div>
            <Progress value={interest} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Academic: {academic}%</span>
            </div>
            <Progress value={academic} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProgressTracker() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Compass className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Progress Tracker</h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Interest vs Academic Strength</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Comparison per stream. Final Score = 0.5 × Academic + 0.5 × Interest
                  </p>
                </CardHeader>
                <CardContent className="grid gap-3">
                  {(
                    Object.keys(streamScores) as Array<StreamKey>
                  ).map((key) => (
                    <StreamRow
                      key={key}
                      name={key}
                      interest={streamScores[key].interest}
                      academic={streamScores[key].academic}
                    />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Study Material Links (Dynamic)</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(Object.keys(studyLinks) as Array<StreamKey>).map((stream) => (
                    <Card key={stream} className="border">
                      <CardContent className="pt-4">
                        <p className="font-medium mb-2">{stream}</p>
                        <ul className="space-y-2">
                          {studyLinks[stream].map((link, idx) => (
                            <li key={idx}>
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                {link.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    These resources complement your current standing. Explore and build momentum.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Motivational Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    With consistent effort, you can achieve your career goals. Keep going — small, steady steps lead to
                    big results.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(Object.keys(recommendations) as Array<StreamKey>).map((key) => {
                    const rec = recommendations[key];
                    return (
                      <Card key={key} className="border">
                        <CardContent className="pt-4">
                          <p className="font-medium mb-2">{rec.title}</p>
                          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                            {rec.bullets.map((b, i) => (
                              <li key={i}>{b}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
