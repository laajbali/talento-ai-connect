import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { BriefcaseBusiness, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CANDIDATES } from "@/lib/data";
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

const STAGES: ApplicationStatus[] = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Rejected",
  "Hired",
];

function JobApplicants() {
  const { jobId } = useParams({ from: "/hr/jobs/$jobId" });
  const { state, update } = useStore();
  const [tab, setTab] = useState<"All" | ApplicationStatus>("All");
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

  const ranked = rankCandidates(job, CANDIDATES);
  const list = ranked.filter(
    ({ candidate }) => tab === "All" || (state.candidateStages[candidate.id] ?? "Applied") === tab,
  );

  return (
    <AppShell variant="employer" title={job.title}>
      <PageHeader
        title={job.title}
        subtitle={`${job.location} · ${job.type} · ${job.status}`}
        action={
          <Button asChild size="sm" variant="outline">
            <Link to="/hr/jobs">All jobs</Link>
          </Button>
        }
      />

      <section className="surface mb-4 p-5">
        <p className="text-sm text-muted-foreground">{job.description}</p>
        <div className="mt-3">
          <p className="text-xs font-semibold">Required skills</p>
          <SkillChips skills={job.skills} />
        </div>
      </section>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          {(["All", ...STAGES] as const).map((t) => (
            <TabsTrigger key={t} value={t}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {list.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={`No applicants in ${tab}`}
          body="Move candidates into this stage from another tab, or wait for new applications."
        />
      ) : (
        <div className="space-y-3">
          {list.map(({ candidate, match }) => {
            const stage = state.candidateStages[candidate.id] ?? "Applied";
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

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Select
                    value={stage}
                    onValueChange={(v) => {
                      update((s) => ({
                        ...s,
                        candidateStages: {
                          ...s.candidateStages,
                          [candidate.id]: v as ApplicationStatus,
                        },
                      }));
                      toast.success(`${candidate.name} moved to ${v}.`);
                    }}
                  >
                    <SelectTrigger className="w-[170px]" aria-label={`Stage for ${candidate.name}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/hr/candidates/$candidateId" params={{ candidateId: candidate.id }}>
                      View profile
                    </Link>
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
