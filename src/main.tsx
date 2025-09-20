import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import Dashboard from "@/pages/Dashboard.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProgressTracker from "@/pages/ProgressTracker.tsx";
import TodoList from "@/pages/TodoList.tsx";
import Scores from "@/pages/Scores.tsx";
import CareerPath from "@/pages/CareerPath.tsx";
import Scholarships from "@/pages/Scholarships.tsx";
import CareerGoalPage from "@/pages/CareerGoal.tsx";
import PersonalInterestsPage from "@/pages/PersonalInterests.tsx";
import AptitudeTestPage from "@/pages/AptitudeTest.tsx";
import ProfilePage from "@/pages/Profile.tsx";
import CollegeDashboard from "@/pages/CollegeDashboard.tsx";
import "./types/global.d.ts";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/college-dashboard" element={<CollegeDashboard />} />
            <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
            <Route path="/progress-tracker" element={<ProgressTracker />} />
            <Route path="/to-do-list" element={<TodoList />} />
            <Route path="/scores" element={<Scores />} />
            <Route path="/career-path" element={<CareerPath />} />
            <Route path="/scholarships" element={<Scholarships />} />
            <Route path="/career-goal" element={<CareerGoalPage />} />
            <Route path="/personal-interests" element={<PersonalInterestsPage />} />
            <Route path="/aptitude-test" element={<AptitudeTestPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);