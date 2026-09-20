import { createFileRoute, Link } from "@tanstack/react-router";
import { Briefcase, CalendarCheck, ChevronRight, ScanText, Star, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { StatTile } from "@/components/brand";
import { Button } from "@/components/ui/button";
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

      <Link
        to="/hr/screening"
        className="surface brand-gradient mt-4 flex items-center gap-3 p-4 transition-colors hover:bg-muted/60"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-foreground text-background">
          <ScanText className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">AI CV Screening</span>
          <span className="block truncate text-xs text-muted-foreground">
            Screen and match candidates faster with AI
          </span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </Link>

      <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile value={active.length} label="Active jobs" icon={<Briefcase className="h-4 w-4" />} />
        <StatTile value={totals.applicants} label="Total applicants" icon={<Users className="h-4 w-4" />} />
        <StatTile value={totals.shortlisted} label="Shortlisted" icon={<Star className="h-4 w-4" />} />
        <StatTile value={totals.interviews} label="Interviews" icon={<CalendarCheck className="h-4 w-4" />} />
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
