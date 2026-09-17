import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, CalendarCheck, Star, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AiBadge, StatTile } from "@/components/brand";
import { ScorePill } from "@/components/match";
import { statusClass } from "./app.applications";
import { Button } from "@/components/ui/button";
import { CANDIDATES } from "@/lib/data";
import { rankCandidates } from "@/lib/matching";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/hr/")({
  head: () => ({
    meta: [
      { title: "Hiring dashboard — Talento" },
      {
        name: "description",
        content: "Active jobs, applicants, shortlists and AI-recommended candidates at a glance.",
      },
      { property: "og:title", content: "Hiring dashboard — Talento" },
      { property: "og:description", content: "Your hiring activity in one view." },
    ],
  }),
  component: HrHome,
});

function HrHome() {
  const { state } = useStore();
  const jobs = state.jobs;
  const active = jobs.filter((j) => j.status === "Active");
  const totals = jobs.reduce(
    (acc, j) => ({
      applicants: acc.applicants + j.applicants,
      shortlisted: acc.shortlisted + j.shortlisted,
      interviews: acc.interviews + j.interviews,
    }),
    { applicants: 0, shortlisted: 0, interviews: 0 },
  );
  const topJob = active[0] ?? jobs[0]!;
  const recommended = rankCandidates(topJob, CANDIDATES).slice(0, 3);

  return (
    <AppShell variant="employer" title="Hiring dashboard">
      <section className="surface brand-gradient p-5">
        <h1 className="text-2xl font-bold">Smart hiring starts here</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {active.length} active jobs · {totals.applicants} applicants this month
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/hr/jobs/new">Post a job</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/hr/search">AI candidate search</Link>
          </Button>
        </div>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile value={active.length} label="Active jobs" icon={<Briefcase className="h-4 w-4" />} />
        <StatTile value={totals.applicants} label="Total applicants" icon={<Users className="h-4 w-4" />} />
        <StatTile value={totals.shortlisted} label="Shortlisted" icon={<Star className="h-4 w-4" />} />
        <StatTile value={totals.interviews} label="Interviews" icon={<CalendarCheck className="h-4 w-4" />} />
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent applications</h2>
          <Link to="/hr/candidates" className="text-sm font-semibold text-primary">
            See all
          </Link>
        </div>
        <div className="surface divide-y divide-border">
          {CANDIDATES.slice(0, 5).map((c) => (
            <Link
              key={c.id}
              to="/hr/candidates/$candidateId"
              params={{ candidateId: c.id }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/60"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                {c.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{c.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {c.title} · {c.university}
                </span>
              </span>
              <span className={statusClass(state.candidateStages[c.id] ?? "Applied")}>
                {state.candidateStages[c.id] ?? "Applied"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
          Recommended for {topJob.title} <AiBadge />
        </h2>
        <div className="grid gap-3 lg:grid-cols-3">
          {recommended.map(({ candidate, match }) => (
            <article key={candidate.id} className="surface p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {candidate.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{candidate.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{candidate.title}</p>
                </div>
              </div>
              <div className="mt-3">
                <ScorePill score={match.score} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Matches on {match.matching.slice(0, 3).join(", ") || "few required skills"}.
                {match.missing.length ? ` Missing ${match.missing.join(", ")}.` : " No gaps."}
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                <Link to="/hr/candidates/$candidateId" params={{ candidateId: candidate.id }}>
                  View profile
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="surface mt-6 p-5">
        <h2 className="font-semibold">Hiring activity</h2>
        <div className="mt-3 space-y-3">
          {jobs.slice(0, 4).map((j) => {
            const pct = j.applicants ? Math.round((j.shortlisted / j.applicants) * 100) : 0;
            return (
              <div key={j.id}>
                <div className="flex justify-between text-sm">
                  <span className="truncate">{j.title}</span>
                  <span className="text-muted-foreground">
                    {j.shortlisted}/{j.applicants} shortlisted
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
