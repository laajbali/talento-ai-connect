import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Briefcase, FileText, Sparkles, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AiBadge, MatchRing, StatTile } from "@/components/brand";
import { JobCard, ScorePill } from "@/components/match";
import { Button } from "@/components/ui/button";
import { JOBS, jobById } from "@/lib/data";
import { careerReadiness, computeMatch, rankJobs, toProfile } from "@/lib/matching";
import { cvCompletion, profileCompletion, useStore } from "@/lib/store";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Your career home — Talento" },
      {
        name: "description",
        content: "See your readiness score, recommended jobs and next career steps in one place.",
      },
      { property: "og:title", content: "Your career home — Talento" },
      { property: "og:description", content: "Readiness, matches and next steps." },
    ],
  }),
  component: SeekerHome,
});

function SeekerHome() {
  const { state, update } = useStore();
  const cvPct = cvCompletion(state.cv);
  const profilePct = profileCompletion(state.seeker);
  const readiness = careerReadiness(state.seeker, cvPct);
  const ranked = rankJobs(toProfile(state.seeker, state.cv.projects.length), JOBS).slice(0, 3);
  const recent = state.viewedJobs.map(jobById).filter(Boolean);

  const toggleSave = (id: string) =>
    update((s) => ({
      ...s,
      savedJobs: s.savedJobs.includes(id)
        ? s.savedJobs.filter((j) => j !== id)
        : [...s.savedJobs, id],
    }));

  return (
    <AppShell variant="seeker" title="Home">
      <section className="surface brand-gradient p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="truncate text-2xl font-bold">{state.seeker.fullName.split(" ")[0]} 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              You are {readiness.score}% ready for {state.targetRole} roles.
            </p>
          </div>
          <MatchRing value={readiness.score} label="Readiness" size={92} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link to="/app/analysis">
              <Sparkles className="mr-1 h-4 w-4" /> Career analysis
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/app/gap">Career gap analysis</Link>
          </Button>
        </div>
      </section>

      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatTile
          value={`${profilePct}%`}
          label="Profile completion"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <StatTile
          value={state.cvSource ? `${cvPct}% complete` : "Not created"}
          label="CV status"
          icon={<FileText className="h-4 w-4" />}
        />
        <StatTile
          value={state.applications.length}
          label="Active applications"
          icon={<Briefcase className="h-4 w-4" />}
        />
      </section>

      {profilePct < 100 && (
        <div className="surface mt-4 flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-semibold">Finish your profile to improve matching</p>
            <p className="text-xs text-muted-foreground">
              Profiles above 90% get 2x more employer views.
            </p>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link to="/app/profile">Complete profile</Link>
          </Button>
        </div>
      )}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recommended for you</h2>
          <Link to="/app/jobs" className="text-sm font-semibold text-primary">
            See all
          </Link>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {ranked.map(({ job, match }) => (
            <JobCard
              key={job.id}
              job={job}
              match={match}
              saved={state.savedJobs.includes(job.id)}
              onSave={() => toggleSave(job.id)}
            />
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-bold">Recently viewed</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {recent.map((job) => {
              if (!job) return null;
              const match = computeMatch(toProfile(state.seeker), job);
              return (
                <Link
                  key={job.id}
                  to="/app/jobs/$jobId"
                  params={{ jobId: job.id }}
                  className="surface flex items-center justify-between gap-3 p-3"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{job.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {job.company} · {job.location}
                    </span>
                  </span>
                  <ScorePill score={match.score} />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="surface mt-6 p-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <AiBadge /> Career development suggestions
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• Learn Power BI — it appears in 4 of your 6 recommended jobs.</li>
          <li>• Add one analytics project to your CV to close the experience gap.</li>
          <li>• Ask for an English proficiency certificate to strengthen your profile.</li>
        </ul>
        <Button asChild size="sm" variant="outline" className="mt-4">
          <Link to="/app/path">
            Open career path <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </section>
    </AppShell>
  );
}
