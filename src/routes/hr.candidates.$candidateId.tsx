import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Bookmark, Mail, Star, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { AiBadge, EmptyState, MatchRing } from "@/components/brand";
import { MatchBreakdown, SkillChips } from "@/components/match";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { matchInsight } from "@/lib/ai.functions";
import { candidateById } from "@/lib/data";
import { candidateToProfile, computeMatch } from "@/lib/matching";
import { useStore } from "@/lib/store";
import type { ApplicationStatus } from "@/lib/types";

export const Route = createFileRoute("/hr/candidates/$candidateId")({
  head: () => ({
    meta: [
      { title: "Candidate profile — Talento" },
      {
        name: "description",
        content: "Full candidate profile with AI match insights, skills, projects and CV.",
      },
      { property: "og:title", content: "Candidate profile — Talento" },
      { property: "og:description", content: "Evidence-based candidate evaluation." },
    ],
  }),
  component: CandidateProfile,
});

interface Insight {
  verdict: string;
  strong: string[];
  risks: string[];
  recommendation: string;
}

const stages: ApplicationStatus[] = [
  "Applied",
  "Under Review",
  "Shortlisted",
  "Interview",
  "Rejected",
  "Hired",
];

function CandidateProfile() {
  const { candidateId } = useParams({ from: "/hr/candidates/$candidateId" });
  const { state, update } = useStore();
  const candidate = candidateById(candidateId);
  const [jobId, setJobId] = useState(state.jobs[0]!.id);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [cvOpen, setCvOpen] = useState(false);

  if (!candidate) {
    return (
      <AppShell variant="employer" title="Candidate">
        <EmptyState
          icon={<UserX className="h-6 w-6" />}
          title="Candidate not found"
          body="This candidate profile is no longer available."
          action={
            <Button asChild variant="outline">
              <Link to="/hr/candidates">Back to candidates</Link>
            </Button>
          }
        />
      </AppShell>
    );
  }

  const job = state.jobs.find((j) => j.id === jobId)!;
  const match = computeMatch(candidateToProfile(candidate), job);
  const saved = state.savedCandidates.includes(candidate.id);
  const stage = state.candidateStages[candidate.id] ?? "Applied";

  const runInsight = async () => {
    setLoading(true);
    try {
      const result = (await matchInsight({
        data: {
          candidate: `${candidate.name}, ${candidate.degree} in ${candidate.major}, ${candidate.years} years experience, skills: ${candidate.skills.join(", ")}`,
          job: `${job.title} requiring ${job.skills.join(", ")}, ${job.minYears}+ years`,
          score: match.score,
          matching: match.matching,
          missing: match.missing,
        },
      })) as Insight | null;
      if (!result?.verdict) throw new Error("empty");
      setInsight(result);
    } catch {
      toast.error("AI insight is unavailable right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell variant="employer" title={candidate.name}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div className="space-y-4">
          <section className="surface p-5">
            <div className="flex items-start gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-accent text-lg font-bold text-accent-foreground">
                {candidate.initials}
              </span>
              <div className="min-w-0">
                <h1 className="text-xl font-bold">{candidate.name}</h1>
                <p className="text-sm text-muted-foreground">{candidate.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {candidate.degree} in {candidate.major} · {candidate.university} · GPA{" "}
                  {candidate.gpa}
                </p>
                <p className="text-xs text-muted-foreground">
                  {candidate.location} · Available {candidate.availability} · Graduated{" "}
                  {candidate.graduationYear}
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{candidate.summary}</p>
          </section>

          <section className="surface p-5">
            <h2 className="font-semibold">Skills</h2>
            <div className="mt-2">
              <SkillChips skills={candidate.skills} />
            </div>
            <h2 className="mt-4 font-semibold">Experience</h2>
            {candidate.experience.length ? (
              candidate.experience.map((e) => (
                <div key={e.role} className="mt-2 text-sm">
                  <p className="font-medium">
                    {e.role} — {e.company}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {e.period} · {e.summary}
                  </p>
                </div>
              ))
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No formal experience yet.</p>
            )}
            <h2 className="mt-4 font-semibold">Projects</h2>
            {candidate.projects.map((p) => (
              <div key={p.name} className="mt-2 text-sm">
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.description}</p>
              </div>
            ))}
            <h2 className="mt-4 font-semibold">Certifications & languages</h2>
            <div className="mt-2">
              <SkillChips skills={[...candidate.certifications, ...candidate.languages]} />
            </div>
          </section>

          <section className="surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-semibold">
                <AiBadge /> AI match insights
              </h2>
              <Button size="sm" onClick={runInsight} disabled={loading}>
                {loading ? "Analysing…" : insight ? "Run again" : "Generate insight"}
              </Button>
            </div>
            {loading && (
              <div className="mt-4 space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-4 animate-pulse rounded bg-muted" />
                ))}
              </div>
            )}
            {insight && !loading && (
              <div className="mt-3 space-y-3 text-sm">
                <p>{insight.verdict}</p>
                <div>
                  <p className="text-xs font-semibold text-success">Strong areas</p>
                  <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                    {insight.strong?.map((s) => <li key={s}>• {s}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold text-destructive">Risks / gaps</p>
                  <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                    {insight.risks?.map((s) => <li key={s}>• {s}</li>)}
                  </ul>
                </div>
                <p className="rounded-lg bg-accent px-3 py-2 text-xs text-accent-foreground">
                  {insight.recommendation}
                </p>
              </div>
            )}
            {!insight && !loading && (
              <p className="mt-2 text-sm text-muted-foreground">
                Generate a written evaluation of this candidate against {job.title}.
              </p>
            )}
            <div className="mt-4">
              <MatchBreakdown match={match} />
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="surface flex flex-col items-center p-5 text-center">
            <MatchRing value={match.score} size={110} />
            <Select value={jobId} onValueChange={setJobId}>
              <SelectTrigger className="mt-3" aria-label="Compare against job">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {state.jobs.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-4 w-full space-y-2 text-left">
              <p className="text-xs font-semibold text-success">Matching skills</p>
              <SkillChips skills={match.matching} />
              {match.missing.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-destructive">Missing</p>
                  <SkillChips skills={match.missing} variant="missing" />
                </>
              )}
            </div>
          </div>

          <div className="surface p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">Hiring stage</p>
              <button
                type="button"
                aria-label={saved ? "Remove from saved" : "Save candidate"}
                title={saved ? "Remove from saved" : "Save candidate"}
                onClick={() =>
                  update((s) => ({
                    ...s,
                    savedCandidates: saved
                      ? s.savedCandidates.filter((c) => c !== candidate.id)
                      : [...s.savedCandidates, candidate.id],
                  }))
                }
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Bookmark className={`h-4 w-4 ${saved ? "fill-current text-primary" : ""}`} />
              </button>
            </div>
            <Select
              value={stage}
              onValueChange={(v) => {
                update((s) => ({
                  ...s,
                  candidateStages: { ...s.candidateStages, [candidate.id]: v as ApplicationStatus },
                }));
                toast.success(`${candidate.name} moved to ${v}.`);
              }}
            >
              <SelectTrigger className="mt-2" aria-label="Hiring stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stages.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {stage !== "Shortlisted" && (
              <Button
                className="mt-3 w-full"
                onClick={() => {
                  update((s) => ({
                    ...s,
                    candidateStages: { ...s.candidateStages, [candidate.id]: "Shortlisted" },
                  }));
                  toast.success(`${candidate.name} shortlisted.`);
                }}
              >
                <Star className="mr-1 h-4 w-4" /> Shortlist candidate
              </Button>
            )}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="h-9" onClick={() => setContactOpen(true)}>
                <Mail className="mr-1 h-4 w-4" /> Contact candidate
              </Button>
              <Button variant="outline" size="sm" className="h-9" onClick={() => setCvOpen(true)}>
                View CV
              </Button>
            </div>
          </div>
        </aside>
      </div>

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact {candidate.name}</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Hi ${candidate.name.split(" ")[0]}, we'd love to talk to you about the ${job.title} role…`}
          />
          <Button
            onClick={() => {
              if (message.trim().length < 15) {
                toast.error("Write at least a short message (15 characters).");
                return;
              }
              setContactOpen(false);
              setMessage("");
              toast.success(`Message sent to ${candidate.name}.`);
            }}
          >
            Send message
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={cvOpen} onOpenChange={setCvOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{candidate.name} — CV</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 rounded-xl border border-border p-5 text-sm">
            <div>
              <p className="text-lg font-bold">{candidate.name}</p>
              <p className="text-primary">{candidate.title}</p>
              <p className="text-xs text-muted-foreground">{candidate.location}</p>
            </div>
            <p>{candidate.summary}</p>
            <p>
              <strong>Education:</strong> {candidate.degree} in {candidate.major},{" "}
              {candidate.university} ({candidate.graduationYear}), GPA {candidate.gpa}
            </p>
            <p>
              <strong>Skills:</strong> {candidate.skills.join(" · ")}
            </p>
            {candidate.experience.map((e) => (
              <p key={e.role}>
                <strong>{e.role}</strong>, {e.company} ({e.period}) — {e.summary}
              </p>
            ))}
            <p>
              <strong>Certifications:</strong> {candidate.certifications.join(" · ") || "—"}
            </p>
            <p>
              <strong>Languages:</strong> {candidate.languages.join(" · ")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
