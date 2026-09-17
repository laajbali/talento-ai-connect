import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, SearchX, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AiBadge, EmptyState } from "@/components/brand";
import { ScorePill, SkillChips } from "@/components/match";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseCandidateQuery } from "@/lib/ai.functions";
import { CANDIDATES } from "@/lib/data";
import { rankCandidates } from "@/lib/matching";
import { useStore } from "@/lib/store";
import type { Candidate } from "@/lib/types";

export const Route = createFileRoute("/hr/search")({
  head: () => ({
    meta: [
      { title: "AI candidate search — Talento" },
      {
        name: "description",
        content: "Describe the person you need in plain language and Talento builds the search.",
      },
      { property: "og:title", content: "AI candidate search — Talento" },
      { property: "og:description", content: "Natural-language hiring search." },
    ],
  }),
  component: AiSearch,
});

interface Criteria {
  skills?: string[];
  major?: string;
  degree?: string;
  location?: string;
  minYears?: number | null;
  maxYears?: number | null;
  availability?: string;
  graduationYear?: number | null;
  certifications?: string[];
  interpretation?: string;
}

const EXAMPLES = [
  "I need a fresh graduate in AI with Python and SQL, preferably in Riyadh.",
  "Senior data analyst with Power BI and 3+ years, available immediately.",
  "Computer science graduate with machine learning projects and a GPA above 4.",
];

function AiSearch() {
  const { state } = useStore();
  const [query, setQuery] = useState("");
  const [criteria, setCriteria] = useState<Criteria | null>(null);
  const [matches, setMatches] = useState<Candidate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (q: string) => {
    if (q.trim().length < 10) {
      setError("Describe the role in a full sentence (at least 10 characters).");
      return;
    }
    setError(null);
    setLoading(true);
    setCriteria(null);
    setMatches(null);
    try {
      const parsed = (await parseCandidateQuery({ data: { query: q } })) as Criteria | null;
      if (!parsed) throw new Error("empty");
      setCriteria(parsed);
      setMatches(filterCandidates(parsed));
    } catch {
      setError("The AI search is unavailable right now. Please try again in a moment.");
      toast.error("Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const job = state.jobs[0]!;

  return (
    <AppShell variant="employer" title="AI candidate search">
      <PageHeader
        title="AI candidate search"
        subtitle="Describe who you need — Talento turns it into search criteria."
      />

      <section className="surface p-5">
        <label htmlFor="q" className="flex items-center gap-2 text-sm font-semibold">
          <AiBadge /> What are you looking for?
        </label>
        <Textarea
          id="q"
          rows={3}
          className="mt-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="I need a fresh graduate in AI with Python and SQL, preferably in Riyadh."
          aria-invalid={!!error}
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => run(query)} disabled={loading}>
            <Search className="mr-1 h-4 w-4" />
            {loading ? "Searching…" : "Search candidates"}
          </Button>
          {EXAMPLES.map((e) => (
            <button
              key={e}
              type="button"
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
              onClick={() => {
                setQuery(e);
                void run(e);
              }}
            >
              {e.slice(0, 40)}…
            </button>
          ))}
        </div>
      </section>

      {loading && (
        <div className="mt-4 space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface h-28 animate-pulse bg-muted/40" />
          ))}
        </div>
      )}

      {criteria && !loading && (
        <section className="surface mt-4 p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <Sparkles className="h-4 w-4 text-primary" /> How Talento read your request
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{criteria.interpretation}</p>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <Criterion label="Skills" value={criteria.skills?.join(", ")} />
            <Criterion label="Major" value={criteria.major} />
            <Criterion label="Degree" value={criteria.degree} />
            <Criterion label="Location" value={criteria.location} />
            <Criterion
              label="Experience"
              value={
                criteria.minYears || criteria.maxYears
                  ? `${criteria.minYears ?? 0}–${criteria.maxYears ?? "+"} years`
                  : undefined
              }
            />
            <Criterion label="Availability" value={criteria.availability} />
            <Criterion label="Graduation year" value={criteria.graduationYear?.toString()} />
            <Criterion label="Certifications" value={criteria.certifications?.join(", ")} />
          </div>
        </section>
      )}

      {matches && !loading && (
        <section className="mt-4">
          <h2 className="mb-3 text-lg font-bold">{matches.length} candidates found</h2>
          {matches.length === 0 ? (
            <EmptyState
              icon={<SearchX className="h-6 w-6" />}
              title="No candidate fits that description yet"
              body="Try relaxing one requirement — for example the location or the exact graduation year."
            />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {rankCandidates(job, matches).map(({ candidate, match }) => (
                <article key={candidate.id} className="surface p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                      {candidate.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{candidate.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {candidate.degree} in {candidate.major} · {candidate.university}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <ScorePill score={match.score} />
                    <span className="text-xs text-muted-foreground">
                      {candidate.years} yrs · {candidate.location}
                    </span>
                  </div>
                  <div className="mt-2">
                    <SkillChips skills={candidate.skills.slice(0, 6)} />
                  </div>
                  <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                    <Link to="/hr/candidates/$candidateId" params={{ candidateId: candidate.id }}>
                      View profile
                    </Link>
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}

function Criterion({ label, value }: { label: string; value?: string | undefined }) {
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm">{value && value.trim() ? value : "Not specified"}</p>
    </div>
  );
}

function filterCandidates(c: Criteria) {
  return CANDIDATES.filter((cand) => {
    if (c.location && c.location.trim() && !cand.location.toLowerCase().includes(c.location.toLowerCase()))
      return false;
    if (c.major && c.major.trim()) {
      const m = c.major.toLowerCase();
      if (!cand.major.toLowerCase().includes(m) && !m.includes(cand.major.toLowerCase())) return false;
    }
    if (typeof c.minYears === "number" && cand.years < c.minYears) return false;
    if (typeof c.maxYears === "number" && cand.years > c.maxYears) return false;
    if (c.availability && c.availability.trim() && cand.availability !== c.availability) return false;
    if (c.skills?.length) {
      const hit = c.skills.some((s) =>
        cand.skills.some((cs) => cs.toLowerCase().includes(s.toLowerCase())),
      );
      if (!hit) return false;
    }
    return true;
  });
}
