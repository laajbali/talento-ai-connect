import { createFileRoute } from "@tanstack/react-router";
import { Check, SearchX, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { JobCard } from "@/components/match";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JOBS } from "@/lib/data";
import { rankJobs, toProfile } from "@/lib/matching";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app/jobs/")({
  head: () => ({
    meta: [
      { title: "Find jobs — Talento" },
      {
        name: "description",
        content: "Search jobs ranked by how well they match your skills, education and experience.",
      },
      { property: "og:title", content: "Find jobs — Talento" },
      { property: "og:description", content: "Jobs ranked by explained match score." },
    ],
  }),
  component: JobsPage,
});

function JobsPage() {
  const { state, update } = useStore();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [location, setLocation] = useState("all");
  const [sort, setSort] = useState("match");
  const [savedOnly, setSavedOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftType, setDraftType] = useState(type);
  const [draftLocation, setDraftLocation] = useState(location);
  const [draftSavedOnly, setDraftSavedOnly] = useState(savedOnly);

  const activeFilters: { key: "type" | "location" | "saved"; label: string }[] = [];
  if (type !== "all") activeFilters.push({ key: "type", label: type });
  if (location !== "all") activeFilters.push({ key: "location", label: location });
  if (savedOnly) activeFilters.push({ key: "saved", label: "Saved jobs" });

  const openFilters = () => {
    setDraftType(type);
    setDraftLocation(location);
    setDraftSavedOnly(savedOnly);
    setFiltersOpen(true);
  };

  const applyFilters = () => {
    setType(draftType);
    setLocation(draftLocation);
    setSavedOnly(draftSavedOnly);
    setFiltersOpen(false);
  };

  const removeFilter = (key: "type" | "location" | "saved") => {
    if (key === "type") setType("all");
    else if (key === "location") setLocation("all");
    else setSavedOnly(false);
  };

  const results = useMemo(() => {
    let list = rankJobs(toProfile(state.seeker, state.cv.projects.length), JOBS);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        ({ job }) =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.skills.some((s) => s.toLowerCase().includes(q)),
      );
    }
    if (type !== "all") list = list.filter(({ job }) => job.type === type);
    if (location !== "all") list = list.filter(({ job }) => job.location.includes(location));
    if (savedOnly) list = list.filter(({ job }) => state.savedJobs.includes(job.id));
    if (sort === "recent") list = [...list].reverse();
    return list;
  }, [query, type, location, savedOnly, sort, state.seeker, state.cv.projects.length, state.savedJobs]);

  const toggleSave = (id: string) =>
    update((s) => ({
      ...s,
      savedJobs: s.savedJobs.includes(id)
        ? s.savedJobs.filter((j) => j !== id)
        : [...s.savedJobs, id],
    }));

  return (
    <AppShell variant="seeker" title="Find Jobs">
      <PageHeader title="Find jobs" subtitle={`${results.length} jobs found for your profile`} />

      <div className="surface mb-3 space-y-3 p-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by job title, skill or company"
          aria-label="Search jobs"
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-9 min-w-0 flex-1 justify-start"
            onClick={openFilters}
            aria-label="Filters"
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span className="truncate">
              Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}
            </span>
          </Button>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger
              aria-label="Sort"
              className="h-9 w-auto shrink-0 gap-1 rounded-lg border-border bg-card px-3 text-xs shadow-sm"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best match</SelectItem>
              <SelectItem value="recent">Most recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
              {(draftType !== "all" || draftLocation !== "all" || draftSavedOnly) && (
                <button
                  type="button"
                  className="text-sm font-medium text-primary"
                  onClick={() => {
                    setDraftType("all");
                    setDraftLocation("all");
                    setDraftSavedOnly(false);
                  }}
                >
                  Clear all
                </button>
              )}
            </div>

            <fieldset className="mb-4">
              <legend className="mb-2 text-sm font-semibold">Job type</legend>
              <div className="space-y-1">
                {[
                  { value: "all", label: "All types" },
                  { value: "Full-time", label: "Full-time" },
                  { value: "Internship", label: "Internship" },
                  { value: "Remote", label: "Remote" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm hover:bg-muted/60"
                  >
                    <span>{opt.label}</span>
                    <span className="flex items-center">
                      {draftType === opt.value && <Check className="h-4 w-4 text-primary" />}
                      <input
                        type="radio"
                        name="job-type"
                        value={opt.value}
                        checked={draftType === opt.value}
                        onChange={() => setDraftType(opt.value)}
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
                  { value: "all", label: "All locations" },
                  { value: "Riyadh", label: "Riyadh" },
                  { value: "Dhahran", label: "Dhahran" },
                  { value: "Remote", label: "Remote" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg border border-transparent px-3 py-2 text-sm hover:bg-muted/60"
                  >
                    <span>{opt.label}</span>
                    <span className="flex items-center">
                      {draftLocation === opt.value && <Check className="h-4 w-4 text-primary" />}
                      <input
                        type="radio"
                        name="job-location"
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
          title="No jobs match these filters"
          body="Try removing a filter or searching for a different skill."
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {results.map(({ job, match }) => (
            <JobCard
              key={job.id}
              job={job}
              match={match}
              saved={state.savedJobs.includes(job.id)}
              onSave={() => toggleSave(job.id)}
            />
          ))}
        </div>
      )}
    </AppShell>
  );
}
