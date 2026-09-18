import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck, MapPin } from "lucide-react";
import type { ReactNode } from "react";
import { AiBadge } from "./brand";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MatchResult } from "@/lib/matching";
import type { Candidate, Job } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function matchTone(score: number) {
  return score >= 85 ? "success" : score >= 65 ? "primary" : "warning";
}

export function ScorePill({ score }: { score: number }) {
  const { t } = useI18n();
  const tone = matchTone(score);
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-bold",
        tone === "success" && "bg-success/10 text-success",
        tone === "primary" && "bg-primary/10 text-primary",
        tone === "warning" && "bg-warning/15 text-warning",
      )}
    >
      {score}% {t("match")}
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
            variant === "improve" && "bg-warning/15 text-warning",
          )}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function MatchExplanation({
  children,
  heading,
}: {
  children: ReactNode;
  heading: string;
}) {
  const { t } = useI18n();

  return (
    <div className="mt-2.5 flex-1 rounded-lg bg-muted/60 p-2.5 text-xs text-muted-foreground">
      <p className="mb-1.5 flex items-center gap-1.5 font-semibold text-foreground">
        <AiBadge /> {t(heading)}
      </p>
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}

function CardActions({
  primary,
  saved,
  onSave,
}: {
  primary: ReactNode;
  saved: boolean;
  onSave: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
      <div className="min-w-0 [&>*]:w-full">{primary}</div>
      <Button size="sm" variant="outline" onClick={onSave} className="min-w-16 bg-background text-foreground">
        {t(saved ? "Saved" : "Save")}
      </Button>
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
  const { t } = useI18n();
  return (
    <article className="surface flex h-full min-w-0 flex-col p-3.5">
      <div className="flex items-start gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-xs font-bold text-accent-foreground">
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
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onSave}
              aria-label={t(saved ? "Remove from saved jobs" : "Save job")}
              className="-me-2 -mt-2 shrink-0 text-muted-foreground hover:text-primary"
            >
              {saved ? (
                <BookmarkCheck className="h-5 w-5 text-primary" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" /> {job.location} · {job.posted}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <ScorePill score={match.score} />
        <Badge variant="secondary">{job.level}</Badge>
        {job.salary && <span className="text-xs text-muted-foreground">{job.salary}</span>}
      </div>

      <MatchExplanation heading="Why this matches you">
        <p>
          {match.matching.length
            ? `You already have ${match.matching.join(", ")}.`
            : "Your profile overlaps only partly with the required skills."}{" "}
          {match.missing.length
            ? `Missing: ${match.missing.join(", ")}.`
            : "No required skills are missing."}
        </p>
      </MatchExplanation>

      <CardActions
        saved={saved}
        onSave={onSave}
        primary={
        <Button asChild size="sm" variant="outline" className="bg-background text-foreground">
          <Link to="/app/jobs/$jobId" params={{ jobId: job.id }}>
            {t("View details")}
          </Link>
        </Button>
        }
      />
    </article>
  );
}

export function CandidateCard({
  candidate,
  match,
  jobTitle,
  saved,
  onSave,
  status,
  showEducation = false,
  showSkills = false,
  explanation,
  actions,
}: {
  candidate: Candidate;
  match?: MatchResult;
  jobTitle?: string;
  saved?: boolean;
  onSave?: () => void;
  status?: ReactNode;
  showEducation?: boolean;
  showSkills?: boolean;
  explanation?: string;
  actions?: ReactNode;
}) {
  const { t } = useI18n();

  return (
    <article className="surface flex h-full min-w-0 flex-col p-3.5">
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
          {candidate.initials}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-semibold" data-no-translate>{candidate.name}</h3>
          <p className="break-words text-xs text-muted-foreground">{candidate.title}</p>
          {showEducation && (
            <>
              <p className="break-words text-xs text-muted-foreground">
                {candidate.degree} in {candidate.major} · {candidate.university}
              </p>
              <p className="break-words text-xs text-muted-foreground">
                GPA {candidate.gpa} · {candidate.years} yrs · {candidate.location}
              </p>
            </>
          )}
        </div>
        {onSave ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onSave}
            aria-label={t(saved ? "Remove saved candidate" : "Save candidate")}
            className="-me-2 -mt-2 shrink-0 text-muted-foreground hover:text-primary"
          >
            {saved ? <BookmarkCheck className="text-primary" /> : <Bookmark />}
          </Button>
        ) : <span />}
      </div>

      {(match || jobTitle || status) && (
        <div className="mt-2.5 flex min-w-0 flex-wrap items-center gap-1.5">
          {match && <ScorePill score={match.score} />}
          {status && <div className="shrink-0">{status}</div>}
          {jobTitle && <span className="min-w-0 break-words text-xs text-muted-foreground">vs {jobTitle}</span>}
        </div>
      )}
      {showSkills && <div className="mt-2"><SkillChips skills={candidate.skills.slice(0, 6)} /></div>}
      {explanation && (
        <MatchExplanation heading="Why this candidate matches">{explanation}</MatchExplanation>
      )}
      {actions && onSave ? (
        <CardActions primary={actions} saved={Boolean(saved)} onSave={onSave} />
      ) : actions ? (
        <div className="mt-2.5 [&>*]:w-full">{actions}</div>
      ) : null}
    </article>
  );
}

export function MatchBreakdown({ match }: { match: MatchResult }) {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      {match.dimensions.map((d) => (
        <div key={d.label} className="rounded-xl border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">{t(d.label)}</p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                d.verdict === "Match" && "bg-success/10 text-success",
                d.verdict === "Partial" && "bg-warning/15 text-warning",
                d.verdict === "Missing" && "bg-destructive/10 text-destructive",
              )}
            >
              {t(d.verdict === "Partial" ? "Needs improvement" : d.verdict)}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t(d.detail)}</p>
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
