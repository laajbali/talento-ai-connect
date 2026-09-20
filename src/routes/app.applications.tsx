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
import { useI18n } from "@/lib/i18n";

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
    status === "Under Review" && "bg-warning/15 text-warning",
    status === "Applied" && "bg-muted text-muted-foreground",
    status === "Hired" && "bg-success/10 text-success",
  );
}

function Applications() {
  const { t } = useI18n();
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

      <Tabs value={filter} onValueChange={setFilter} className="mb-4 min-w-0">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="flex h-10 w-max min-w-full flex-nowrap justify-start">
          {filters.map((f) => (
            <TabsTrigger key={f} value={f} className="h-8 shrink-0">
              {t(f)}
            </TabsTrigger>
          ))}
          </TabsList>
        </div>
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
                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-xs font-bold text-accent-foreground">
                    {job.companyLogo}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 font-semibold leading-snug">{job.title}</h3>
                        <p className="truncate text-xs text-muted-foreground">
                          {job.company} · Applied {app.appliedAt}
                        </p>
                      </div>
                      <span className={cn(statusClass(app.status), "shrink-0 whitespace-nowrap")}>{t(app.status)}</span>
                    </div>
                  </div>
                </div>

                {expanded && (
                  <ol className="mt-4 space-y-3 border-l border-border pl-4">
                    {app.timeline.map((event) => (
                      <li key={event.label} className="relative text-sm">
                        <span
                          className={`absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full ${
                            event.done ? "bg-primary" : "bg-muted"
                          }`}
                        />
                        <p className={event.done ? "font-medium" : "text-muted-foreground"}>{t(event.label)}</p>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </li>
                    ))}
                  </ol>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
                  <Button size="sm" variant="outline" className="min-h-10 sm:min-h-0" onClick={() => setOpen(expanded ? null : app.id)}>
                    {expanded ? "Hide details" : "View details"}
                  </Button>
                  <Button asChild size="sm" variant="ghost" className="min-h-10 sm:min-h-0">
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
