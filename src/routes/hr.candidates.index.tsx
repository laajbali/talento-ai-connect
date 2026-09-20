import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, SearchX, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { CandidateCard } from "@/components/match";
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftAvailability, setDraftAvailability] = useState(availability);
  const [draftLocation, setDraftLocation] = useState(location);
  const job = state.jobs.find((j) => j.id === jobId)!;

  const activeFilters: { key: "availability" | "location"; label: string }[] = [];
  if (availability !== "all") activeFilters.push({ key: "availability", label: availability });
  if (location !== "all") activeFilters.push({ key: "location", label: location });

  const openFilters = () => {
    setDraftAvailability(availability);
    setDraftLocation(location);
    setFiltersOpen(true);
  };

  const applyFilters = () => {
    setAvailability(draftAvailability);
    setLocation(draftLocation);
    setFiltersOpen(false);
  };

  const removeFilter = (key: "availability" | "location") => {
    if (key === "availability") setAvailability("all");
    else setLocation("all");
  };

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
      />

      <div className="surface mb-4 w-full min-w-0 max-w-full space-y-3 overflow-hidden p-4">
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
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start"
          onClick={openFilters}
          aria-label="Filters"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
        </Button>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => removeFilter(f.key)}
                className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-card px-2.5 text-xs font-medium text-foreground shadow-sm"
                aria-label={`Remove filter ${f.label}`}
              >
                {f.label}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border border-border bg-background p-4 shadow-xl sm:mx-auto sm:max-w-md">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold">Filters</h2>
              {(draftAvailability !== "all" || draftLocation !== "all") && (
                <button
                  type="button"
                  className="text-sm font-medium text-primary"
                  onClick={() => {
                    setDraftAvailability("all");
                    setDraftLocation("all");
                  }}
                >
                  Clear all
                </button>
              )}
            </div>

            <fieldset className="mb-4">
              <legend className="mb-2 text-sm font-semibold">Availability</legend>
              <div className="space-y-1">
                {[
                  { value: "all", label: "Any availability" },
                  { value: "Immediately", label: "Immediately" },
                  { value: "1 month", label: "1 month" },
                  { value: "3 months", label: "3 months" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm hover:bg-muted/60"
                  >
                    <span>{opt.label}</span>
                    <span className="flex items-center">
                      {draftAvailability === opt.value && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      <input
                        type="radio"
                        name="availability"
                        value={opt.value}
                        checked={draftAvailability === opt.value}
                        onChange={() => setDraftAvailability(opt.value)}
                        className="sr-only"
                      />
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mb-5">
              <legend className="mb-2 text-sm font-semibold">Location</legend>
              <div className="space-y-1">
                {[
                  { value: "all", label: "Any location" },
                  { value: "Riyadh", label: "Riyadh" },
                  { value: "Dhahran", label: "Dhahran" },
                  { value: "Jeddah", label: "Jeddah" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm hover:bg-muted/60"
                  >
                    <span>{opt.label}</span>
                    <span className="flex items-center">
                      {draftLocation === opt.value && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      <input
                        type="radio"
                        name="location"
                        value={opt.value}
                        checked={draftLocation === opt.value}
                        onChange={() => setDraftLocation(opt.value)}
                        className="sr-only"
                      />
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Button type="button" className="w-full" onClick={applyFilters}>
              Apply filters
            </Button>
          </div>
        </div>
      )}

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
        <div className="grid w-full min-w-0 grid-cols-1 gap-3 lg:grid-cols-2">
          {results.map(({ candidate, match }) => {
            const saved = state.savedCandidates.includes(candidate.id);
            return (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                match={match}
                jobTitle={job.title}
                saved={saved}
                onSave={() => toggleSave(candidate.id)}
                showEducation
                showSkills
                explanation={`${match.matching.length ? `Matches on ${match.matching.join(", ")}.` : "Limited overlap with required skills."}${match.missing.length ? ` Missing ${match.missing.join(", ")}.` : ""}`}
                actions={
                  <Button asChild size="sm" className="w-full">
                    <Link to="/hr/candidates/$candidateId" params={{ candidateId: candidate.id }}>
                      View profile
                    </Link>
                  </Button>
                }
              />
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
