import { createFileRoute, Link } from "@tanstack/react-router";
import { BriefcaseBusiness, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";
import type { JobStatus } from "@/lib/types";

export const Route = createFileRoute("/hr/jobs/")({
  head: () => ({
    meta: [
      { title: "Job management — Talento" },
      { name: "description", content: "Create, edit, pause and close your job posts in one place." },
      { property: "og:title", content: "Job management — Talento" },
      { property: "og:description", content: "Track applicants, shortlists and hires per job." },
    ],
  }),
  component: HrJobs,
});

const TABS = ["All", "Active", "Draft", "Closed"] as const;

function HrJobs() {
  const { state, update } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const jobs = state.jobs.filter((j) => tab === "All" || j.status === tab);

  const setStatus = (id: string, status: JobStatus) => {
    update((s) => ({ ...s, jobs: s.jobs.map((j) => (j.id === id ? { ...j, status } : j)) }));
    toast.success(`Job ${status === "Closed" ? "closed" : status === "Draft" ? "paused" : "published"}.`);
  };

  return (
    <AppShell variant="employer" title="Jobs">
      <PageHeader title="Job management" subtitle={`${state.jobs.length} jobs`} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as (typeof TABS)[number])} className="mb-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          {TABS.map((t) => (
            <TabsTrigger key={t} value={t}>
              {t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {jobs.length === 0 ? (
        <EmptyState
          icon={<BriefcaseBusiness className="h-6 w-6" />}
          title={`No ${tab.toLowerCase()} jobs`}
          body="Create a job post and Talento will write the description for you."
          action={
            <Button asChild>
              <Link to="/hr/jobs/new">Post a job</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <article key={j.id} className="surface p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <h2 className="truncate font-semibold">{j.title}</h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {j.location} · {j.type} · posted {j.posted}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    j.status === "Active"
                      ? "bg-success/10 text-success"
                      : j.status === "Draft"
                        ? "bg-warning/15 text-warning"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {j.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Metric label="Applicants" value={j.applicants} />
                <Metric label="Shortlisted" value={j.shortlisted} />
                <Metric label="Interviews" value={j.interviews} />
                <Metric label="Hired" value={j.hired} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to="/hr/jobs/$jobId" params={{ jobId: j.id }}>
                    View applicants
                  </Link>
                </Button>
                {j.status === "Active" ? (
                  <Button size="sm" variant="outline" onClick={() => setStatus(j.id, "Draft")}>
                    Pause
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setStatus(j.id, "Active")}>
                    Publish
                  </Button>
                )}
                {j.status !== "Closed" && (
                  <Button size="sm" variant="ghost" onClick={() => setStatus(j.id, "Closed")}>
                    Close
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2 text-center">
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
