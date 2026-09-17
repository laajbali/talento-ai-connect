import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AiBadge, MatchRing } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { analyzeCareer } from "@/lib/ai.functions";
import { careerReadiness } from "@/lib/matching";
import { cvCompletion, useStore } from "@/lib/store";

export const Route = createFileRoute("/app/analysis")({
  head: () => ({
    meta: [
      { title: "AI Career Analysis — Talento" },
      {
        name: "description",
        content: "Understand your career readiness, strengths and what to improve next.",
      },
      { property: "og:title", content: "AI Career Analysis — Talento" },
      { property: "og:description", content: "Your readiness score, fully explained." },
    ],
  }),
  component: Analysis,
});

interface AiAnalysis {
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendedSkills: { skill: string; reason: string; weeks: number }[];
  nextSteps: string[];
}

function Analysis() {
  const { state } = useStore();
  const readiness = careerReadiness(state.seeker, cvCompletion(state.cv));
  const [ai, setAi] = useState<AiAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const result = (await analyzeCareer({
        data: {
          degree: state.seeker.degree,
          major: state.seeker.major,
          university: state.seeker.university,
          years: state.seeker.years,
          skills: state.seeker.skills,
          certifications: state.seeker.certifications,
          projects: state.cv.projects.map((p) => `${p.name}: ${p.description}`),
          targetRole: state.targetRole,
        },
      })) as AiAnalysis | null;
      if (!result?.summary) throw new Error("empty");
      setAi(result);
    } catch {
      toast.error("Analysis is unavailable right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell variant="seeker" title="Career Analysis">
      <PageHeader
        title="Career analysis"
        subtitle="Understand your strengths and your next steps."
      />

      <section className="surface grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-5">
        <MatchRing value={readiness.score} label="Readiness" size={110} />
        <div className="min-w-0">
          <h2 className="font-semibold">Overall career readiness</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Calculated from your skills depth, certifications, experience, education and CV
            completeness — every factor is listed below.
          </p>
        </div>
      </section>

      <section className="surface mt-4 p-5">
        <h2 className="text-sm font-semibold">How the score is built</h2>
        <div className="mt-3 space-y-3">
          {readiness.breakdown.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-sm">
                <span>{b.label}</span>
                <span className="font-semibold">{b.value}%</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${b.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="surface mt-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex items-center gap-2 font-semibold">
            <AiBadge /> AI skills review
          </p>
          <Button size="sm" onClick={run} disabled={loading}>
            <Sparkles className="mr-1 h-4 w-4" />
            {loading ? "Analysing…" : ai ? "Run again" : "Run AI analysis"}
          </Button>
        </div>

        {loading && (
          <div className="mt-4 space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-muted" />
            ))}
          </div>
        )}

        {!loading && !ai && (
          <p className="mt-3 text-sm text-muted-foreground">
            Run the analysis to get a written review of your profile against {state.targetRole}{" "}
            roles, including what is strong, what is weak and what to learn next.
          </p>
        )}

        {ai && !loading && (
          <div className="mt-4 space-y-5">
            <p className="text-sm">{ai.summary}</p>
            <List title="Strengths" items={ai.strengths} tone="success" />
            <List title="Areas for improvement" items={ai.improvements} tone="warning" />
            <div>
              <p className="mb-2 text-sm font-semibold">Recommended skills</p>
              <div className="space-y-2">
                {ai.recommendedSkills?.map((s) => (
                  <div key={s.skill} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{s.skill}</p>
                      <span className="text-xs text-muted-foreground">~{s.weeks} weeks</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{s.reason}</p>
                  </div>
                ))}
              </div>
            </div>
            <List title="Your next steps" items={ai.nextSteps} tone="primary" />
          </div>
        )}
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link to="/app/gap">Compare against a target job</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/app/path">See my career path</Link>
        </Button>
      </div>
    </AppShell>
  );
}

function List({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "success" | "warning" | "primary";
}) {
  if (!items?.length) return null;
  const dot =
    tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-primary";
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{title}</p>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
