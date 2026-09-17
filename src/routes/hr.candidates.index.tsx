import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { ScorePill, SkillChips } from "@/components/match";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANDIDATES } from "@/lib/data";
import { rankCandidates } from "@/lib/matching";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/hr/candidates/")({
  head: () => ({
    meta: [
      { title: "Candidates — Talento" },
      {
        name: "description",
        content: "Browse and filter candidates ranked against your open roles with explained scores.",
      },
      { property: "og:title", content: "Candidates — Talento" },
      { property: "og:description", content: "Ranked candidates with evidence." },
    ],
  }),
  component: Candidates,
});

function Candidates() {
  const { state, update } = useStore();
  const [jobId, setJobId] = useState(state.jobs[0]!.id);
  const [query, setQuery] = useState("");
  const [availability, setAvailability] = useState("all");
  const [location, setLocation] = useState("all");
  const job = state.jobs.find((j) => j.id === jobId)!;

  const results = useMemo(() => {
    let list = rankCandidates(job, CANDIDATES);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        ({ candidate }) =>
          candidate.name.toLowerCase().includes(q) ||
          candidate.major.toLowerCase().includes(q) ||
          candidate.university.toLowerCase().includes(q) ||
          candidate.skills.some((s) => s.toLowerCase().includes(q)),
      );
    }
    if (availability !== "all")
      list = list.filter(({ candidate }) => candidate.availability === availability);
    if (location !== "all")
      list = list.filter(({ candidate }) => candidate.location.includes(location));
    return list;
  }, [job, query, availability, location]);

  const toggleSave = (id: string) =>
    update((s) => ({
      ...s,
      savedCandidates: s.savedCandidates.includes(id)
        ? s.savedCandidates.filter((c) => c !== id)
        : [...s.savedCandidates, id],
    }));

  return (
    <AppShell variant="employer" title="Candidates">
      <PageHeader
        title="Candidates"
        subtitle={`${results.length} candidates matched against ${job.title}`}
        action={
          <Button asChild size="sm" variant="outline">
            <Link to="/hr/search">AI search</Link>
          </Button>
        }
      />

      <div className="surface mb-4 space-y-3 p-4">
        <Select value={jobId} onValueChange={setJobId}>
          <SelectTrigger aria-label="Match against job">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {state.jobs.map((j) => (
              <SelectItem key={j.id} value={j.id}>
                Match against: {j.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, skill, major or university"
          aria-label="Search candidates"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <Select value={availability} onValueChange={setAvailability}>
            <SelectTrigger aria-label="Availability">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any availability</SelectItem>
              <SelectItem value="Immediately">Immediately</SelectItem>
              <SelectItem value="1 month">1 month</SelectItem>
              <SelectItem value="3 months">3 months</SelectItem>
            </SelectContent>
          </Select>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger aria-label="Location">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any location</SelectItem>
              <SelectItem value="Riyadh">Riyadh</SelectItem>
              <SelectItem value="Dhahran">Dhahran</SelectItem>
              <SelectItem value="Jeddah">Jeddah</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={<SearchX className="h-6 w-6" />}
          title="No candidates match these filters"
          body="Widen your filters or try the AI search with a plain-language description."
          action={
            <Button asChild>
              <Link to="/hr/search">Try AI search</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {results.map(({ candidate, match }) => {
            const saved = state.savedCandidates.includes(candidate.id);
            return (
              <article key={candidate.id} className="surface p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
                    {candidate.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{candidate.name}</h3>
                        <p className="truncate text-xs text-muted-foreground">
                          {candidate.degree} in {candidate.major} · {candidate.university}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          GPA {candidate.gpa} · {candidate.years} yrs · {candidate.location}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={saved ? "Remove saved candidate" : "Save candidate"}
                        onClick={() => toggleSave(candidate.id)}
                      >
                        {saved ? (
                          <BookmarkCheck className="h-5 w-5 text-primary" />
                        ) : (
                          <Bookmark className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <ScorePill score={match.score} />
                  <span className="text-xs text-muted-foreground">
                    vs {job.title}
                  </span>
                </div>
                <div className="mt-2">
                  <SkillChips skills={candidate.skills.slice(0, 6)} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {match.matching.length
                    ? `Matches on ${match.matching.join(", ")}.`
                    : "Limited overlap with required skills."}
                  {match.missing.length ? ` Missing ${match.missing.join(", ")}.` : ""}
                </p>
                <Button asChild size="sm" className="mt-3 w-full">
                  <Link to="/hr/candidates/$candidateId" params={{ candidateId: candidate.id }}>
                    View profile
                  </Link>
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
