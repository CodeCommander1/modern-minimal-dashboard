import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { GraduationCap, ArrowLeft, Save, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type ClassLevel = "class10" | "class12";
type Stream = "Science" | "Commerce" | "Arts";

const CLASS10_SUBJECTS: Array<string> = [
  "Mathematics",
  "Science (Physics, Chemistry, Biology combined)",
  "Social Science",
  "English Language and Literature",
  "Second Language",
  "Computer Science",
];

const CLASS12_SUBJECTS: Record<Stream, Array<string>> = {
  Science: ["Physics", "Chemistry", "Mathematics or Biology", "English", "Computer Science"],
  Commerce: ["Accountancy", "Business Studies", "Economics", "English", "Mathematics / IP"],
  Arts: ["History", "Political Science", "Geography", "English", "Sociology / Psychology"],
};

type ScoreForm = Record<string, { score: string; maxScore: string }>;

export default function Scores() {
  const navigate = useNavigate();

  const [classLevel, setClassLevel] = useState<ClassLevel>("class10");
  const [stream, setStream] = useState<Stream>("Science");

  const saved = useQuery(api.dashboard.getScoresByClassStream, {
    classLevel,
    stream: classLevel === "class12" ? stream : undefined,
  }) ?? [];

  const saveScores = useMutation(api.dashboard.saveScoresBulk);

  const subjects = useMemo<Array<string>>(
    () => (classLevel === "class10" ? CLASS10_SUBJECTS : CLASS12_SUBJECTS[stream]),
    [classLevel, stream],
  );

  const initialForm: ScoreForm = useMemo(() => {
    const entries = subjects.map((s) => [s, { score: "", maxScore: "100" } as const]);
    return Object.fromEntries(entries) as ScoreForm;
  }, [subjects]);

  const [form, setForm] = useState<ScoreForm>(initialForm);

  // Reset form when class/stream changes
  useMemo(() => setForm(initialForm), [initialForm]);

  function handleChange(subj: string, field: "score" | "maxScore", value: string) {
    setForm((prev) => ({
      ...prev,
      [subj]: { ...prev[subj], [field]: value.replace(/[^\d.]/g, "") },
    }));
  }

  async function onSaveAll() {
    const toSave = subjects
      .map((subj) => {
        const s = form[subj];
        const scoreNum = Number(s?.score ?? "");
        const maxNum = Number(s?.maxScore ?? "100");
        if (Number.isFinite(scoreNum) && Number.isFinite(maxNum) && s?.score !== "") {
          return { subject: subj, score: scoreNum, maxScore: maxNum || 100 };
        }
        return null;
      })
      .filter(Boolean) as Array<{ subject: string; score: number; maxScore: number }>;

    if (toSave.length === 0) {
      toast.error("Enter at least one score");
      return;
    }

    try {
      await saveScores({
        classLevel,
        stream: classLevel === "class12" ? stream : undefined,
        scores: toSave,
      });
      toast.success("Scores saved");
    } catch {
      toast.error("Failed to save scores");
    }
  }

  function onReset() {
    setForm(initialForm);
  }

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
              <h1 className="text-2xl font-bold tracking-tight">Scores</h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Add / Update Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Class</label>
                    <Select value={classLevel} onValueChange={(v) => setClassLevel(v as ClassLevel)}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="class10">Class 10</SelectItem>
                        <SelectItem value="class12">Class 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {classLevel === "class12" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Stream</label>
                      <Select value={stream} onValueChange={(v) => setStream(v as Stream)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Stream" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Science">Science</SelectItem>
                          <SelectItem value="Commerce">Commerce</SelectItem>
                          <SelectItem value="Arts">Arts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="ml-auto flex gap-2">
                    <Button type="button" variant="outline" onClick={onReset}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                    <Button type="button" onClick={onSaveAll}>
                      <Save className="mr-2 h-4 w-4" />
                      Save All
                    </Button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {subjects.map((subj) => (
                    <Card key={subj} className="border">
                      <CardContent className="pt-4">
                        <p className="font-medium mb-3">{subj}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Score</label>
                            <Input
                              inputMode="numeric"
                              placeholder="e.g., 78"
                              value={form[subj]?.score ?? ""}
                              onChange={(e) => handleChange(subj, "score", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs text-muted-foreground">Max Score</label>
                            <Input
                              inputMode="numeric"
                              placeholder="100"
                              value={form[subj]?.maxScore ?? "100"}
                              onChange={(e) => handleChange(subj, "maxScore", e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Saved Scores</CardTitle>
              </CardHeader>
              <CardContent>
                {saved.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No scores yet. Add some on the left.</p>
                ) : (
                  <ul className="space-y-3">
                    {saved.map((s: any) => (
                      <li key={s._id} className="flex items-center justify-between rounded-md border p-3">
                        <div>
                          <p className="text-sm font-medium">{s.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.classLevel === "class12" && s.stream ? `${s.stream} • ` : ""}
                            {new Date(s.testDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          {s.score}/{s.maxScore}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
