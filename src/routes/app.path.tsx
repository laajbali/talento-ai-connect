import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Circle } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AiBadge, MatchRing } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app/path")({
  head: () => ({
    meta: [
      { title: "Career Path — Talento" },
      {
        name: "description",
        content: "A personalised step-by-step plan to reach your target role.",
      },
      { property: "og:title", content: "Career Path — Talento" },
      { property: "og:description", content: "Your roadmap, one step at a time." },
    ],
  }),
  component: CareerPath,
});

const steps = [
  {
    title: "Learn Power BI",
    weeks: 4,
    detail: "Take a structured course and publish two dashboards you can show in interviews.",
  },
  {
    title: "Build a data analytics project",
    weeks: 2,
    detail: "Apply SQL, Python and Power BI end to end on a real dataset.",
  },
  {
    title: "Improve SQL",
    weeks: 2,
    detail: "Practise window functions and query optimisation — they appear in most interviews.",
  },
  { title: "Add the project to your CV", weeks: 1, detail: "Showcase outcomes and numbers, not tasks." },
  { title: "Apply to relevant jobs", weeks: 1, detail: "Target roles above 85% match first." },
];

function CareerPath() {
  const { state, set } = useStore();
  const done = state.pathProgress;
  const progress = Math.round((done / steps.length) * 100);

  return (
    <AppShell variant="seeker" title="Career Path">
      <PageHeader
        title="Your career path"
        subtitle={`A personalised plan to reach ${state.targetRole} roles.`}
      />

      <section className="surface grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-5">
        <MatchRing value={progress} label="Complete" size={100} />
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <AiBadge /> {done} of {steps.length} steps completed
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {done < steps.length
              ? `Current step: ${steps[done]!.title}.`
              : "You finished the plan — time to apply."}
          </p>
        </div>
      </section>

      <ol className="mt-4 space-y-3">
        {steps.map((step, i) => {
          const complete = i < done;
          const current = i === done;
          return (
            <li
              key={step.title}
              className={`surface flex gap-3 p-4 ${current ? "ring-2 ring-primary" : ""}`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                  complete
                    ? "bg-success text-success-foreground"
                    : current
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {complete ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{step.title}</p>
                  <span className="text-xs text-muted-foreground">{step.weeks} weeks</span>
                  {current && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      Current step
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                {current && (
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      set({ pathProgress: done + 1 });
                      toast.success(`"${step.title}" marked as complete.`);
                    }}
                  >
                    Mark as complete
                  </Button>
                )}
                {complete && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-success">
                    <Check className="h-3 w-3" /> Completed
                  </p>
                )}
                {!complete && !current && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Circle className="h-3 w-3" /> Upcoming
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex flex-wrap gap-2">
        {done > 0 && (
          <Button variant="ghost" onClick={() => set({ pathProgress: done - 1 })}>
            Undo last step
          </Button>
        )}
        <Button asChild variant="outline">
          <Link to="/app/jobs">Apply to matching jobs</Link>
        </Button>
      </div>
    </AppShell>
  );
}
