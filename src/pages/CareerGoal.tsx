import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { ArrowLeft, Target } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CareerGoalPage() {
  const navigate = useNavigate();
  const dashboardData = useQuery(api.dashboard.getDashboardOverview);
  const setCareerGoal = useMutation(api.dashboard.setCareerGoal);

  const [goalInput, setGoalInput] = useState<string>("");
  const [guidedStream, setGuidedStream] = useState<"Science" | "Commerce" | "Arts">("Science");
  const [improvement, setImprovement] = useState<string>("");
  const [smartTarget, setSmartTarget] = useState<string>("75");
  const [timelineMonths, setTimelineMonths] = useState<string>("3");

  useEffect(() => {
    setGoalInput(dashboardData?.user?.currentCareerGoal ?? "");
  }, [dashboardData?.user?.currentCareerGoal]);

  async function handleSaveGoal() {
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
  }

  async function handleSaveSmartGoal() {
    try {
      const imp = improvement.trim();
      if (!imp) {
        toast.error("Describe what you want to improve");
        return;
      }
      const target = Math.max(1, Math.min(100, Number(smartTarget || "0")));
      const months = Math.max(1, Number(timelineMonths || "1"));
      const formatted = `${imp} • Stream: ${guidedStream} • SMART Target: ${target}% in ${months} month${months > 1 ? "s" : ""}`;
      await setCareerGoal({ currentCareerGoal: formatted });
      setGoalInput(formatted);
      toast.success("SMART goal saved");
    } catch {
      toast.error("Failed to save SMART goal");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-8 py-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Career Goal</h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Add Goal (Quick)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder='e.g., "Become a Software Engineer"'
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                  />
                  <Button onClick={handleSaveGoal}>Save</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Tip: Be specific. Example: "MBBS → General Physician" or "B.Tech CSE → SDE".
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Current:{" "}
                  <span className="font-medium">
                    {dashboardData?.user?.currentCareerGoal || "Not set"}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Guided Goal Setting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Choose Stream</label>
                  <Select value={guidedStream} onValueChange={(v) => setGuidedStream(v as any)}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select Stream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Commerce">Commerce</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs text-muted-foreground">What do you want to improve?</label>
                  <Input
                    placeholder='e.g., "Improve Science basics", "Work on Accountancy"'
                    value={improvement}
                    onChange={(e) => setImprovement(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Tracker Output</label>
                <Input
                  disabled
                  value="Add some scores and complete the Interests questionnaire to see tailored guidance."
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Goal Suggestions</p>
                <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1">
                  <li>Join coaching / online resources</li>
                  <li>Weekly progress updates</li>
                  <li>Subject-wise improvement checklist</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">SMART Target (%)</label>
                  <Input
                    inputMode="numeric"
                    value={smartTarget}
                    onChange={(e) => setSmartTarget(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="75"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Timeline (months)</label>
                  <Input
                    inputMode="numeric"
                    value={timelineMonths}
                    onChange={(e) => setTimelineMonths(e.target.value.replace(/[^\d]/g, ""))}
                    placeholder="3"
                  />
                </div>
                <Button className="w-full sm:w-auto" onClick={handleSaveSmartGoal}>
                  Save SMART Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
