import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, Building2, Check, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { AiBadge, EmptyState, MatchRing } from "@/components/brand";
import { MatchBreakdown, SkillChips } from "@/components/match";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { jobById } from "@/lib/data";
import { computeMatch, toProfile } from "@/lib/matching";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app/jobs/$jobId")({
  head: () => ({
    meta: [
      { title: "Job details — Talento" },
      {
        name: "description",
        content: "Full job description with your match score and exactly what is missing.",
      },
      { property: "og:title", content: "Job details — Talento" },
      { property: "og:description", content: "See why you match this role." },
    ],
  }),
  component: JobDetails,
});

function JobDetails() {
  const { jobId } = useParams({ from: "/app/jobs/$jobId" });
  const { state, update } = useStore();
  const job = jobById(jobId);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!job) return;
    update((s) =>
      s.viewedJobs.includes(job.id)
        ? s
        : { ...s, viewedJobs: [job.id, ...s.viewedJobs].slice(0, 6) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  if (!job) {
    return (
      <AppShell variant="seeker" title="Job details">
        <EmptyState
          icon={<Building2 className="h-6 w-6" />}
          title="Job not found"
          body="This job may have been closed or removed."
          action={
            <Button asChild variant="outline">
              <Link to="/app/jobs">Back to jobs</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const match = computeMatch(toProfile(state.seeker, state.cv.projects.length), job);
  const saved = state.savedJobs.includes(job.id);
  const applied = state.applications.some((a) => a.jobId === job.id);

  const apply = () => {
    setApplying(true);
    setTimeout(() => {
      update((s) => ({
        ...s,
        applications: [
          {
            id: `app-${Date.now()}`,
            jobId: job.id,
            status: "Applied",
            appliedAt: "Just now",
            timeline: [
              { label: "Application submitted", date: "Just now", done: true },
              { label: "CV screening", date: "Pending", done: false },
              { label: "Hiring team review", date: "Pending", done: false },
            ],
          },
          ...s.applications,
        ],
      }));
      setApplying(false);
      toast.success(`Applied to ${job.title} at ${job.company}.`);
    }, 700);
  };

  return (
    <AppShell variant="seeker" title={job.title}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <section className="surface p-5">
            <div className="flex items-start gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent font-bold text-accent-foreground">
                {job.companyLogo}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-bold">{job.title}</h1>
                <p className="text-sm text-muted-foreground">{job.company}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {job.location} · {job.type} · {job.posted}
                </p>
              </div>
              <button
                type="button"
                aria-label={saved ? "Unsave job" : "Save job"}
                onClick={() =>
                  update((s) => ({
                    ...s,
                    savedJobs: saved
                      ? s.savedJobs.filter((j) => j !== job.id)
                      : [...s.savedJobs, job.id],
                  }))
                }
              >
                {saved ? (
                  <BookmarkCheck className="h-5 w-5 text-primary" />
                ) : (
                  <Bookmark className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
            {job.salary && (
              <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm font-medium">{job.salary}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">{job.level}</Badge>
              <Badge variant="secondary">{job.education}</Badge>
              <Badge variant="secondary">
                {job.minYears === 0 ? "Open to graduates" : `${job.minYears}+ years`}
              </Badge>
            </div>
          </section>

          <section className="surface p-5">
            <h2 className="font-semibold">About this role</h2>
            <p className="mt-2 text-sm text-muted-foreground">{job.description}</p>

            <h3 className="mt-4 text-sm font-semibold">Responsibilities</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {job.responsibilities.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>

            <h3 className="mt-4 text-sm font-semibold">Requirements</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {job.requirements.map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>

            <h3 className="mt-4 text-sm font-semibold">Skills</h3>
            <div className="mt-2">
              <SkillChips skills={job.skills} />
            </div>
          </section>

          <section className="surface p-5">
            <h2 className="flex items-center gap-2 font-semibold">
              <AiBadge /> Why you match
            </h2>
            <div className="mt-3">
              <MatchBreakdown match={match} />
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="surface flex flex-col items-center p-5 text-center">
            <MatchRing value={match.score} size={110} />
            <p className="mt-3 text-sm text-muted-foreground">
              {match.score >= 85
                ? "Great match — you meet nearly every requirement."
                : match.score >= 65
                  ? "Good match with a few gaps you can close quickly."
                  : "Partial match — focus on the missing skills first."}
            </p>
            <div className="mt-4 w-full space-y-2 text-left">
              {match.matching.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-success">You have</p>
                  <SkillChips skills={match.matching} />
                </div>
              )}
              {match.missing.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-destructive">Missing</p>
                  <SkillChips skills={match.missing} variant="missing" />
                </div>
              )}
              {match.improve.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-warning">Nice to have</p>
                  <SkillChips skills={match.improve} variant="improve" />
                </div>
              )}
            </div>
            <div className="mt-4 w-full space-y-2">
              {applied ? (
                <p className="flex items-center justify-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm font-semibold text-success">
                  <Check className="h-4 w-4" /> Application submitted
                </p>
              ) : (
                <Button className="w-full" onClick={apply} disabled={applying}>
                  {applying ? "Submitting…" : "Apply now"}
                </Button>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link to="/app/applications">View my applications</Link>
              </Button>
            </div>
          </div>

          <div className="surface p-5">
            <p className="text-sm font-semibold">What to do next</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {match.nextSteps.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
            <Button asChild variant="ghost" size="sm" className="mt-2 px-0">
              <Link to="/app/path">Open my career path</Link>
            </Button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
