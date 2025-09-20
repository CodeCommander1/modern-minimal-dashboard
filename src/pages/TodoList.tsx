import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { CheckSquare, ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { toast } from "sonner";

type Priority = "low" | "medium" | "high";
type Timeframe = "today" | "next_day" | "this_week" | "no_deadline";

function computeDueDate(tf: Timeframe): number | undefined {
  const now = new Date();
  switch (tf) {
    case "today": {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return end.getTime();
    }
    case "next_day": {
      const d = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      d.setHours(23, 59, 59, 999);
      return d.getTime();
    }
    case "this_week": {
      const d = new Date(now);
      const day = d.getDay(); // 0-6
      const diff = 6 - day; // days to Saturday
      d.setDate(d.getDate() + diff);
      d.setHours(23, 59, 59, 999);
      return d.getTime();
    }
    case "no_deadline":
    default:
      return undefined;
  }
}

export default function TodoList() {
  const navigate = useNavigate();
  const tasks = useQuery(api.dashboard.getTasks);
  const createTask = useMutation(api.dashboard.createTask);
  const toggleTask = useMutation(api.dashboard.toggleTask);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [timeframe, setTimeframe] = useState<Timeframe>("next_day");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    setIsSubmitting(true);
    try {
      await createTask({
        title: title.trim(),
        description: undefined,
        dueDate: computeDueDate(timeframe),
        priority,
        category: undefined,
      });
      toast.success("To-Do added");
      setTitle("");
      setPriority("medium");
      setTimeframe("next_day");
    } catch (err) {
      toast.error("Failed to add task");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onToggle(id: string) {
    try {
      await toggleTask({ taskId: id as any });
    } catch {
      toast.error("Failed to update task");
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-8 py-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckSquare className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">To-Do List</h1>
            </div>
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Create a To-Do</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onAddTask} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="e.g., Revise Mathematics"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Timeframe</label>
                      <Select value={timeframe} onValueChange={(v) => setTimeframe(v as Timeframe)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="next_day">Next Day</SelectItem>
                          <SelectItem value="this_week">This Week</SelectItem>
                          <SelectItem value="no_deadline">No Deadline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Add To-Do
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your To-Dos</CardTitle>
              </CardHeader>
              <CardContent>
                {tasks === undefined ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : tasks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No to-dos yet. Add one on the left.</p>
                ) : (
                  <ul className="space-y-3">
                    {tasks.map((t) => (
                      <li key={t._id} className="flex items-start justify-between rounded-md border p-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={t.completed}
                            onCheckedChange={() => onToggle(t._id as any)}
                            aria-label="Toggle complete"
                          />
                          <div>
                            <p className={`text-sm font-medium ${t.completed ? "line-through text-muted-foreground" : ""}`}>
                              {t.title}
                            </p>
                            <div className="flex gap-3 mt-1">
                              <span className="text-xs text-muted-foreground capitalize">Priority: {t.priority}</span>
                              {t.dueDate && (
                                <span className="text-xs text-muted-foreground">
                                  Due: {new Date(t.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
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
