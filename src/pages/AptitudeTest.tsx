import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { ArrowLeft, Award } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";

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

export default function AptitudeTestPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [score, setScore] = useState<number | null>(null);

  function reset() {
    setAnswers({});
    setScore(null);
  }

  function submit() {
    let s = 0;
    for (let i = 0; i < APTITUDE_QUESTIONS.length; i++) {
      const sel = answers[i];
      if (sel !== null && sel !== undefined && sel === APTITUDE_QUESTIONS[i].correctIndex) s += 1;
    }
    setScore(s);
  }

  const level =
    score === null
      ? ""
      : score <= 7
      ? "Beginner"
      : score <= 14
      ? "Intermediate"
      : "Strong Aptitude";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-8 py-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Aptitude Test</h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Answer the following 20 aptitude questions. Each correct answer gives you 1 point.</p>
              <p>Total score will be shown out of 20.</p>
              <ul className="list-disc pl-5 text-xs">
                <li>0–7 = Beginner</li>
                <li>8–14 = Intermediate</li>
                <li>15–20 = Strong Aptitude</li>
              </ul>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {APTITUDE_QUESTIONS.map((item, idx) => (
              <Card key={idx} className="border">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium mb-3">{item.q}</p>
                  <RadioGroup
                    value={
                      answers[idx] === null || answers[idx] === undefined
                        ? undefined
                        : String(answers[idx])
                    }
                    onValueChange={(v) =>
                      setAnswers((prev) => ({
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
                </CardContent>
              </Card>
            ))}
          </div>

          {score !== null && (
            <Card className="mt-6">
              <CardContent className="pt-4 text-sm">
                <p className="font-medium mb-1">Result</p>
                <p>
                  Score: <span className="font-semibold">{score}/20</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Level: {level}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between gap-2 mt-6">
            <div className="flex gap-2">
              <Button variant="outline" onClick={reset}>Reset</Button>
              <Button onClick={submit}>Submit</Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
