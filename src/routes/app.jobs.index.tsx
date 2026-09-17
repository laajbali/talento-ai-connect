import { createFileRoute } from "@tanstack/react-router";
import { SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { JobCard } from "@/components/match";
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
    if (sort === "recent") list = [...list].reverse();
    return list;
  }, [query, type, location, sort, state.seeker, state.cv.projects.length]);

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

      <div className="surface mb-4 space-y-3 p-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by job title, skill or company"
          aria-label="Search jobs"
        />
        <div className="grid gap-2 sm:grid-cols-3">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger aria-label="Employment type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Internship">Internship</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
            </SelectContent>
          </Select>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger aria-label="Location">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              <SelectItem value="Riyadh">Riyadh</SelectItem>
              <SelectItem value="Dhahran">Dhahran</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger aria-label="Sort">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="match">Best match</SelectItem>
              <SelectItem value="recent">Most recent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

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
