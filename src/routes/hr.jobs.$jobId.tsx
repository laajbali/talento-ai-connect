import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { BriefcaseBusiness, Users } from "lucide-react";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { ScorePill, SkillChips } from "@/components/match";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CANDIDATES } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { rankCandidates } from "@/lib/matching";
import { useStore } from "@/lib/store";
import type { ApplicationStatus } from "@/lib/types";

export const Route = createFileRoute("/hr/jobs/$jobId")({
  head: () => ({
    meta: [
      { title: "Applicants — Talento" },
      { name: "description", content: "Review applicants for this role and move them through your pipeline." },
      { property: "og:title", content: "Applicants — Talento" },
      { property: "og:description", content: "Manage your hiring pipeline per job." },
    ],
  }),
  component: JobApplicants,
});

const FILTERS: (ApplicationStatus | "All")[] = [
  "All",
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Rejected",
];

function JobApplicants() {
  const { jobId } = useParams({ from: "/hr/jobs/$jobId" });
  const { t } = useI18n();
  const { state, update } = useStore();
  const [tab, setTab] = useState<ApplicationStatus | "All">("All");
  const job = state.jobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <AppShell variant="employer" title="Job">
        <EmptyState
          icon={<BriefcaseBusiness className="h-6 w-6" />}
          title="Job not found"
          body="This job post no longer exists."
          action={
            <Button asChild variant="outline">
              <Link to="/hr/jobs">Back to jobs</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const toggleSave = (id: string) =>
    update((s) => ({
      ...s,
      savedCandidates: s.savedCandidates.includes(id)
        ? s.savedCandidates.filter((c) => c !== id)
        : [...s.savedCandidates, id],
    }));

  const ranked = rankCandidates(job, CANDIDATES);
  const list = ranked.filter(
    ({ candidate }) => tab === "All" || (state.candidateStages[candidate.id] ?? "Applied") === tab,
  );

  return (
    <AppShell variant="employer" title={job.title}>
      <PageHeader
        title={job.title}
        subtitle={`${job.location} · ${job.type} · ${job.status}`}
      />

      <section className="surface mb-4 p-5">
        <p className="text-sm text-muted-foreground">{job.description}</p>
        <div className="mt-3">
          <p className="text-xs font-semibold">Required skills</p>
          <SkillChips skills={job.skills} />
        </div>
      </section>

      <Select value={tab} onValueChange={(v) => setTab(v as ApplicationStatus | "All")}>
        <SelectTrigger
          aria-label="Filter applicants by status"
          className="mb-4 h-9 w-auto min-w-36 shrink-0 gap-1 rounded-lg border-border bg-card px-3 text-xs shadow-sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FILTERS.map((f) => (
            <SelectItem key={f} value={f} className="text-xs">
              {t(f)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {list.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={`No applicants in ${tab}`}
          body="Move candidates into this stage from another tab, or wait for new applications."
        />
      ) : (
        <div className="space-y-3">
          {list.map(({ candidate, match }) => {
            const saved = state.savedCandidates.includes(candidate.id);
            return (
              <article key={candidate.id} className="surface p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                      {candidate.initials}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{candidate.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {candidate.degree} in {candidate.major} · {candidate.years} yrs
                      </p>
                    </div>
                  </div>
                  <ScorePill score={match.score} />
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {match.matching.length
                    ? `Matches on ${match.matching.join(", ")}.`
                    : "No required skills matched."}
                  {match.missing.length ? ` Missing ${match.missing.join(", ")}.` : " No gaps."}
                </p>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <Button asChild size="sm" className="h-8 px-3 text-xs">
                    <Link to="/hr/candidates/$candidateId" params={{ candidateId: candidate.id }}>
                      {t("View profile")}
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 min-w-16 bg-background px-3 text-xs text-foreground"
                    aria-label={t(saved ? "Remove saved candidate" : "Save candidate")}
                    onClick={() => toggleSave(candidate.id)}
                  >
                    {t(saved ? "Saved" : "Save")}
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
