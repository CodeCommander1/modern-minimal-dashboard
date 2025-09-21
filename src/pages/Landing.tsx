import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Award, 
  ArrowRight,
  CheckCircle,
  Users,
  Star
} from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [streamFilter, setStreamFilter] = useState<"All" | "Science" | "Commerce" | "Arts">("All");
  const [search, setSearch] = useState("");
  const colleges =
    useQuery(api.dashboard.listGovernmentColleges, {
      stream: streamFilter === "All" ? undefined : streamFilter,
    }) ?? [];
  const seedColleges = useMutation(api.dashboard.seedGovernmentColleges);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor your academic journey with detailed progress analytics and milestone tracking."
    },
    {
      icon: Target,
      title: "Goal Management",
      description: "Set, track, and achieve your academic and career goals with personalized guidance."
    },
    {
      icon: BookOpen,
      title: "Study Resources",
      description: "Access curated study materials, links, and resources tailored to your learning needs."
    },
    {
      icon: Award,
      title: "Scholarship Finder",
      description: "Discover scholarship opportunities that match your profile and academic achievements."
    }
  ];

  const stats = [
    { number: "10K+", label: "Students" },
    { number: "95%", label: "Success Rate" },
    { number: "500+", label: "Scholarships" },
    { number: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">E</span>
              </div>
              <span className="font-bold text-lg tracking-tight">EduGuide</span>
            </div>
            
            <div className="flex items-center gap-4">
              {!isLoading && (
                <Button onClick={handleGetStarted}>
                  {isAuthenticated ? "Dashboard" : "Get Started"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              Your Personalized
              <span className="text-primary block">Learning Hub</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Track progress, explore opportunities, and achieve your academic goals with 
              our comprehensive educational dashboard designed for student success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
                {isAuthenticated ? "Go to Dashboard" : "Start Learning"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and resources designed to support your educational journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="text-center p-6 rounded-lg border bg-card hover:shadow-sm transition-all duration-200"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Government Colleges Section */}
      <section className="py-24 px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                Government Colleges
              </h2>
              <p className="text-muted-foreground">
                Explore top public colleges across Science, Commerce, and Arts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-md border p-1 bg-background">
                {(["All", "Science", "Commerce", "Arts"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStreamFilter(s)}
                    className={`h-9 rounded px-3 text-sm font-medium transition-colors ${
                      streamFilter === s
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="w-64">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or city"
                />
              </div>
            </div>
          </motion.div>

          {/* Optional seeding helper if empty */}
          {colleges.length === 0 && (
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-muted-foreground">
                No colleges found. Load sample data to get started.
              </p>
              <Button
                variant="outline"
                onClick={async () => {
                  await seedColleges({});
                }}
              >
                Load Sample Colleges
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {colleges
              .filter((c) => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return (
                  c.name.toLowerCase().includes(q) ||
                  c.city.toLowerCase().includes(q) ||
                  c.state.toLowerCase().includes(q)
                );
              })
              .map((c, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.03 * idx }}
                  className="bg-card text-card-foreground rounded-xl border p-5 shadow-sm hover:shadow-sm transition-all duration-200"
                >
                  <div className="mb-3">
                    <h3 className="font-semibold text-lg tracking-tight">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {c.city}, {c.state}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {c.offersScience && <Badge variant="secondary">Science</Badge>}
                    {c.offersCommerce && <Badge variant="secondary">Commerce</Badge>}
                    {c.offersArts && <Badge variant="secondary">Arts</Badge>}
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium mb-1">Top Courses</p>
                    <div className="flex flex-wrap gap-1.5">
                      {c.topCourses.slice(0, 4).map((course: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs bg-muted text-muted-foreground rounded px-2 py-1"
                        >
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3 grid grid-cols-3 gap-2 text-sm">
                    <div className="rounded border p-2">
                      <p className="text-muted-foreground text-xs">Science</p>
                      <p className="font-semibold">
                        {c.seatsScience ?? "-"}
                      </p>
                    </div>
                    <div className="rounded border p-2">
                      <p className="text-muted-foreground text-xs">Commerce</p>
                      <p className="font-semibold">
                        {c.seatsCommerce ?? "-"}
                      </p>
                    </div>
                    <div className="rounded border p-2">
                      <p className="text-muted-foreground text-xs">Arts</p>
                      <p className="font-semibold">
                        {c.seatsArts ?? "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-muted-foreground">Last Date</span>
                    <span className="font-medium">
                      {new Date(c.lastDate).toLocaleDateString()}
                    </span>
                  </div>

                  <Button asChild className="w-full">
                    <a href={c.officialUrl} target="_blank" rel="noreferrer">
                      Apply / Details
                    </a>
                  </Button>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of students who are already achieving their academic goals with EduGuide
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={handleGetStarted}
              className="text-lg px-8 py-6"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">E</span>
            </div>
            <span className="font-bold tracking-tight">EduGuide</span>
          </div>
          <p className="text-muted-foreground text-sm">
            Empowering students to achieve their academic dreams
          </p>
        </div>
      </footer>
    </div>
  );
}