import { createFileRoute, Link } from "@tanstack/react-router";
import { BookmarkX } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { ScorePill, SkillChips } from "@/components/match";
import { Button } from "@/components/ui/button";
import { candidateById } from "@/lib/data";
import { candidateToProfile, computeMatch } from "@/lib/matching";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/hr/saved")({
  head: () => ({
    meta: [
      { title: "Saved candidates — Talento" },
      { name: "description", content: "Your shortlist of candidates saved for later review." },
      { property: "og:title", content: "Saved candidates — Talento" },
      { property: "og:description", content: "Keep promising talent one click away." },
    ],
  }),
  component: SavedCandidates,
});

function SavedCandidates() {
  const { state, update } = useStore();
  const job = state.jobs[0]!;
  const saved = state.savedCandidates.map(candidateById).filter(Boolean);

  return (
    <AppShell variant="employer" title="Saved candidates">
      <PageHeader title="Saved candidates" subtitle={`${saved.length} saved`} />
      {saved.length === 0 ? (
        <EmptyState
          icon={<BookmarkX className="h-6 w-6" />}
          title="No saved candidates"
          body="Save candidates from search or their profile to build a shortlist you can revisit."
          action={
            <Button asChild>
              <Link to="/hr/candidates">Browse candidates</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {saved.map((c) => {
            const match = computeMatch(candidateToProfile(c!), job);
            return (
              <article key={c!.id} className="surface p-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    {c!.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{c!.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c!.title}</p>
                  </div>
                  <ScorePill score={match.score} />
                </div>
                <div className="mt-2">
                  <SkillChips skills={c!.skills.slice(0, 5)} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Compared with {job.title}: matches on {match.matching.slice(0, 3).join(", ") || "few skills"}.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link to="/hr/candidates/$candidateId" params={{ candidateId: c!.id }}>
                      View profile
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      update((s) => ({
                        ...s,
                        savedCandidates: s.savedCandidates.filter((x) => x !== c!.id),
                      }))
                    }
                  >
                    Remove
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
