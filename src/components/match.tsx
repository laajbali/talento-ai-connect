import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, MapPin } from "lucide-react";
import { AiBadge } from "./brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MatchResult } from "@/lib/matching";
import type { Job } from "@/lib/types";
import { cn } from "@/lib/utils";

export function matchTone(score: number) {
  return score >= 85 ? "success" : score >= 65 ? "primary" : "warning";
}

export function ScorePill({ score }: { score: number }) {
  const tone = matchTone(score);
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-bold",
        tone === "success" && "bg-success/10 text-success",
        tone === "primary" && "bg-primary/10 text-primary",
        tone === "warning" && "bg-warning/20 text-warning-foreground",
      )}
    >
      {score}% match
    </span>
  );
}

export function SkillChips({
  skills,
  variant = "default",
}: {
  skills: string[];
  variant?: "default" | "missing" | "improve";
}) {
  if (!skills.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((s) => (
        <span
          key={s}
          className={cn(
            "rounded-md px-2 py-0.5 text-[11px] font-medium",
            variant === "default" && "bg-muted text-muted-foreground",
            variant === "missing" && "bg-destructive/10 text-destructive",
            variant === "improve" && "bg-warning/20 text-warning-foreground",
          )}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

export function JobCard({
  job,
  match,
  saved,
  onSave,
}: {
  job: Job;
  match: MatchResult;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <article className="surface p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-sm font-bold text-accent-foreground">
          {job.companyLogo}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold">{job.title}</h3>
              <p className="truncate text-sm text-muted-foreground">
                {job.company} · {job.type}
              </p>
            </div>
            <button
              type="button"
              onClick={onSave}
              aria-label={saved ? "Remove from saved jobs" : "Save job"}
              className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
            >
              {saved ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {job.location} · {job.posted}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <ScorePill score={match.score} />
        <Badge variant="secondary">{job.level}</Badge>
        {job.salary && <span className="text-xs text-muted-foreground">{job.salary}</span>}
      </div>

      <div className="mt-3 space-y-2 rounded-xl bg-muted/60 p-3">
        <p className="flex items-center gap-2 text-xs font-semibold">
          <AiBadge /> Why this matches you
        </p>
        <p className="text-xs text-muted-foreground">
          {match.matching.length
            ? `You already have ${match.matching.join(", ")}.`
            : "Your profile overlaps only partly with the required skills."}{" "}
          {match.missing.length
            ? `Missing: ${match.missing.join(", ")}.`
            : "No required skills are missing."}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        <Button asChild size="sm" className="flex-1">
          <Link to="/app/jobs/$jobId" params={{ jobId: job.id }}>
            View details
          </Link>
        </Button>
        <Button size="sm" variant="outline" onClick={onSave}>
          {saved ? "Saved" : "Save"}
        </Button>
      </div>
    </article>
  );
}

export function MatchBreakdown({ match }: { match: MatchResult }) {
  return (
    <div className="space-y-2">
      {match.dimensions.map((d) => (
        <div key={d.label} className="rounded-xl border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{d.label}</p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                d.verdict === "Match" && "bg-success/10 text-success",
                d.verdict === "Partial" && "bg-warning/20 text-warning-foreground",
                d.verdict === "Missing" && "bg-destructive/10 text-destructive",
              )}
            >
              {d.verdict === "Partial" ? "Needs improvement" : d.verdict}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{d.detail}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.round(d.score * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
