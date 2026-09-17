import { createFileRoute, Link } from "@tanstack/react-router";
import { BookmarkX } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { JobCard } from "@/components/match";
import { Button } from "@/components/ui/button";
import { jobById } from "@/lib/data";
import { computeMatch, toProfile } from "@/lib/matching";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app/saved")({
  head: () => ({
    meta: [
      { title: "Saved Jobs — Talento" },
      { name: "description", content: "Your shortlist of saved jobs, with live match scores." },
      { property: "og:title", content: "Saved Jobs — Talento" },
      { property: "og:description", content: "Keep the roles you care about in one place." },
    ],
  }),
  component: SavedJobs,
});

function SavedJobs() {
  const { state, update } = useStore();
  const jobs = state.savedJobs.map(jobById).filter(Boolean);

  return (
    <AppShell variant="seeker" title="Saved Jobs">
      <PageHeader title="Saved jobs" subtitle={`${jobs.length} saved`} />
      {jobs.length === 0 ? (
        <EmptyState
          icon={<BookmarkX className="h-6 w-6" />}
          title="No saved jobs yet"
          body="Tap the bookmark icon on any job to keep it here for later."
          action={
            <Button asChild>
              <Link to="/app/jobs">Find jobs</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {jobs.map((job) => {
            if (!job) return null;
            return (
              <JobCard
                key={job.id}
                job={job}
                match={computeMatch(toProfile(state.seeker, state.cv.projects.length), job)}
                saved
                onSave={() =>
                  update((s) => ({ ...s, savedJobs: s.savedJobs.filter((j) => j !== job.id) }))
                }
              />
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
