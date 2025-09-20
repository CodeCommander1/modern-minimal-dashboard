import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Stream = "Science" | "Commerce" | "Arts";

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
  "What do you like in newspapers/magazines? * Science/tech discoveries (Science) * Business & economy news (Commerce) * Culture, art, and lifestyle (Arts)",
  "What motivates you most? * Discovering new knowledge (Science) * Earning and managing money (Commerce) * Expressing creativity (Arts)",
  "If you had to research a topic, what would it be? * Renewable energy (Science) * Growth of Indian economy (Commerce) * Ancient civilizations (Arts)",
  "Which puzzle do you enjoy? * Logical/scientific puzzle (Science) * Numerical/profit-loss puzzle (Commerce) * Word/creative puzzle (Arts)",
  "Which TV show do you prefer? * Discovery/Science Channel (Science) * Shark Tank/Business shows (Commerce) * National Geographic History/Art shows (Arts)",
  "What excites you in real life? * Inventions and new technology (Science) * Business startups and markets (Commerce) * Museums, books, and culture (Arts)",
];

export default function PersonalInterestsPage() {
  const navigate = useNavigate();
  const saveInterests = useMutation(api.dashboard.saveInterestsResult);

  const [answers, setAnswers] = useState<Record<number, Stream | null>>({});
  const [result, setResult] = useState<{ science: number; commerce: number; arts: number; recommended: Stream } | null>(null);

  function resetInterests() {
    setAnswers({});
    setResult(null);
  }

  function submitInterests() {
    let s = 0, c = 0, a = 0;
    for (let i = 0; i < QUESTIONS.length; i++) {
      const pick = answers[i] || null;
      if (pick === "Science") s += 1;
      if (pick === "Commerce") c += 1;
      if (pick === "Arts") a += 1;
    }
    const max = Math.max(s, c, a);
    const recommended = (max === s ? "Science" : max === c ? "Commerce" : "Arts") as Stream;
    setResult({ science: s, commerce: c, arts: a, recommended });
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
    } catch {
      toast.error("Failed to save recommendation");
    }
  }

  const instructions = useMemo(
    () => ({
      intro: "Instructions: Choose one option per question. Your answers will help us recommend whether your interest is in Science, Commerce, or Arts.",
      scoring: "Scoring Rule: Each selected option adds 1 point to its respective stream. The stream with the highest score becomes your recommended interest area.",
    }),
    [],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-8 py-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Interests & Hobbies</h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Interests & Hobbies Questionnaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{instructions.intro}</p>
              <p className="text-[11px]">{instructions.scoring}</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {QUESTIONS.map((q, idx) => (
              <Card key={idx} className="border">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium mb-3">
                    {idx + 1}. {q}
                  </p>
                  <RadioGroup
                    value={answers[idx] ?? undefined}
                    onValueChange={(v) =>
                      setAnswers((prev) => ({ ...prev, [idx]: v as Stream }))
                    }
                    className="grid sm:grid-cols-3 gap-2"
                  >
                    <label className="flex items-center gap-2 rounded-md border p-2">
                      <RadioGroupItem value="Science" />
                      <span className="text-sm">Option A</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-md border p-2">
                      <RadioGroupItem value="Commerce" />
                      <span className="text-sm">Option B</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-md border p-2">
                      <RadioGroupItem value="Arts" />
                      <span className="text-sm">Option C</span>
                    </label>
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
          </div>

          {result && (
            <Card className="mt-6">
              <CardContent className="pt-4 text-sm">
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
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between gap-2 mt-6">
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetInterests}>Reset</Button>
              <Button onClick={submitInterests}>Submit</Button>
            </div>
            <Button onClick={saveInterestsRecommendation} variant="default">
              Save Recommendation
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
