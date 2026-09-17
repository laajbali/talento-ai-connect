import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSearch } from "lucide-react";
import { useState } from "react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { jobById } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { ApplicationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/applications")({
  head: () => ({
    meta: [
      { title: "My Applications — Talento" },
      { name: "description", content: "Track every application and its current stage." },
      { property: "og:title", content: "My Applications — Talento" },
      { property: "og:description", content: "Know where each application stands." },
    ],
  }),
  component: Applications,
});

const filters: (ApplicationStatus | "All")[] = [
  "All",
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Rejected",
];

export function statusClass(status: string) {
  return cn(
    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
    status === "Shortlisted" && "bg-success/10 text-success",
    status === "Interview" && "bg-info/10 text-info",
    status === "Rejected" && "bg-destructive/10 text-destructive",
    status === "Under Review" && "bg-warning/20 text-warning-foreground",
    status === "Applied" && "bg-muted text-muted-foreground",
    status === "Hired" && "bg-success/10 text-success",
  );
}

function Applications() {
  const { state } = useStore();
  const [filter, setFilter] = useState<string>("All");
  const [open, setOpen] = useState<string | null>(null);

  const list = state.applications.filter((a) => filter === "All" || a.status === filter);

  return (
    <AppShell variant="seeker" title="My Applications">
      <PageHeader
        title="My applications"
        subtitle={`${state.applications.length} applications in total`}
      />

      <Tabs value={filter} onValueChange={setFilter} className="mb-4">
        <TabsList className="flex w-full flex-wrap justify-start">
          {filters.map((f) => (
            <TabsTrigger key={f} value={f}>
              {f}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {list.length === 0 ? (
        <EmptyState
          icon={<FileSearch className="h-6 w-6" />}
          title="No applications here yet"
          body="When you apply to a job it will appear here with its live status."
          action={
            <Button asChild>
              <Link to="/app/jobs">Browse jobs</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((app) => {
            const job = jobById(app.jobId);
            if (!job) return null;
            const expanded = open === app.id;
            return (
              <article key={app.id} className="surface p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-xs font-bold text-accent-foreground">
                    {job.companyLogo}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{job.title}</h3>
                        <p className="truncate text-xs text-muted-foreground">
                          {job.company} · Applied {app.appliedAt}
                        </p>
                      </div>
                      <span className={statusClass(app.status)}>{app.status}</span>
                    </div>
                  </div>
                </div>

                {expanded && (
                  <ol className="mt-4 space-y-3 border-l border-border pl-4">
                    {app.timeline.map((t) => (
                      <li key={t.label} className="relative text-sm">
                        <span
                          className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ${
                            t.done ? "bg-primary" : "bg-muted"
                          }`}
                        />
                        <p className={t.done ? "font-medium" : "text-muted-foreground"}>{t.label}</p>
                        <p className="text-xs text-muted-foreground">{t.date}</p>
                      </li>
                    ))}
                  </ol>
                )}

                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setOpen(expanded ? null : app.id)}>
                    {expanded ? "Hide details" : "View details"}
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link to="/app/jobs/$jobId" params={{ jobId: job.id }}>
                      Open job
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
