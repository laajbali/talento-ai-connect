import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AiBadge, MatchRing } from "@/components/brand";
import { MatchBreakdown, SkillChips } from "@/components/match";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOBS } from "@/lib/data";
import { computeMatch, toProfile } from "@/lib/matching";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app/gap")({
  head: () => ({
    meta: [
      { title: "Career Gap Analysis — Talento" },
      {
        name: "description",
        content:
          "Compare your profile with any target job and see exactly which skills match and which are missing.",
      },
      { property: "og:title", content: "Career Gap Analysis — Talento" },
      { property: "og:description", content: "Your profile vs the job requirements." },
    ],
  }),
  component: GapAnalysis;
});

function GapAnalysis() {
  const { state, set } = useStore();
  const [jobId, setJobId] = useState(JOBS[0]!.id);
  const job = JOBS.find((j) => j.id === jobId)!;
  const match = useMemo(
    () => computeMatch(toProfile(state.seeker, state.cv.projects.length), job),
    [state.seeker, state.cv.projects.length, job],
  );

  return (
    <AppShell variant="seeker" title="Career Gap Analysis">
      <PageHeader
        title="Career gap analysis"
        subtitle="Your profile compared with the requirements of a target job."
      />

      <div className="surface mb-4 p-4">
        <label className="mb-2 block text-sm font-medium" htmlFor="target">
          Target job
        </label>
        <Select
          value={jobId}
          onValueChange={(v) => {
            setJobId(v);
            const selected = JOBS.find((j) => j.id === v);
            if (selected) set({ targetRole: selected.title });
          }}
        >
          <SelectTrigger id="target">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {JOBS.map((j) => (
              <SelectItem key={j.id} value={j.id}>
                {j.title} — {j.company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <section className="surface grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-5">
        <MatchRing value={match.score} size={110} />
        <div className="min-w-0">
          <h2 className="text-lg font-bold">
            {job.title} — {match.score}% match
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {match.matching.length} of {job.skills.length} required skills matched,{" "}
            {match.missing.length} missing.
          </p>
        </div>
      </section>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Panel title="Matching skills" tone="success">
          <SkillChips skills={match.matching} />
          {!match.matching.length && (
            <p className="text-sm text-muted-foreground">No required skills matched yet.</p>
          )}
        </Panel>
        <Panel title="Missing skills" tone="destructive">
          <SkillChips skills={match.missing} variant="missing" />
          {!match.missing.length && (
            <p className="text-sm text-muted-foreground">Nothing missing — you are covered.</p>
          )}
        </Panel>
        <Panel title="Needs improvement" tone="warning">
          <SkillChips skills={match.improve} variant="improve" />
          {!match.improve.length && (
            <p className="text-sm text-muted-foreground">
              You already cover the preferred skills too.
            </p>
          )}
        </Panel>
      </div>

      <section className="surface mt-4 p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <AiBadge /> Why this score
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Each dimension is weighted: required skills 40%, education 18%, experience 18%, preferred
          skills 12%, certifications 7%, projects 5%.
        </p>
        <div className="mt-3">
          <MatchBreakdown match={match} />
        </div>
      </section>

      <section className="surface mt-4 p-5">
        <h2 className="font-semibold">What to do next</h2>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {match.nextSteps.map((s) => (
            <li key={s}>• {s}</li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/app/path">Build my career path</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/app/jobs/$jobId" params={{ jobId: job.id }}>
              View this job
            </Link>
          </Button>
        </div>
      </section>
    </AppShell>
  );
}

function Panel({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "success" | "destructive" | "warning";
  children: React.ReactNode;
}) {
  const color =
    tone === "success"
      ? "text-success"
      : tone === "destructive"
        ? "text-destructive"
        : "text-warning-foreground";
  return (
    <div className="surface space-y-2 p-4">
      <h3 className={`text-sm font-semibold ${color}`}>{title}</h3>
      {children}
    </div>
  );
}
