import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, FileUp, PencilLine, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AiBadge } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateCv } from "@/lib/ai.functions";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { CvSection } from "@/lib/types";

export const Route = createFileRoute("/app/cv-builder")({
  head: () => ({
    meta: [
      { title: "AI CV Builder — Talento" },
      {
        name: "description",
        content: "Build a professional CV with AI, upload an existing one, or write it yourself.",
      },
      { property: "og:title", content: "AI CV Builder — Talento" },
      { property: "og:description", content: "Three ways to get a CV that gets read." },
    ],
  }),
  component: CvBuilder,
});

const questions = [
  { key: "targetRole", label: "What role are you aiming for?", placeholder: "Data Analyst" },
  { key: "education", label: "Your education", placeholder: "BSc Computer Science, King Saud University, 2025, GPA 4.4/5" },
  { key: "experience", label: "Work experience or internships", placeholder: "Data analysis intern at stc, summer 2024 — SQL reports and dashboards" },
  { key: "skills", label: "Your skills", placeholder: "SQL, Python, Excel, Power BI" },
  { key: "projects", label: "Projects", placeholder: "Retail sales dashboard analysing 120k rows" },
  { key: "certifications", label: "Certifications", placeholder: "Google Data Analytics" },
  { key: "languages", label: "Languages", placeholder: "Arabic (native), English (fluent)" },
] as const;

type AnswerKey = (typeof questions)[number]["key"];

function CvBuilder() {
  const { state, set } = useStore();
  const { dir, t } = useI18n();
  const navigate = useNavigate();
  const PreviousIcon = dir === "rtl" ? ArrowRight : ArrowLeft;
  const [mode, setMode] = useState<"choose" | "ai" | "manual">("choose");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<AnswerKey, string>>({
    targetRole: state.targetRole,
    education: `${state.seeker.degree} in ${state.seeker.major}, ${state.seeker.university}, ${state.seeker.graduationYear}, GPA ${state.seeker.gpa}`,
    experience: "",
    skills: state.seeker.skills.join(", "),
    projects: "",
    certifications: state.seeker.certifications.join(", "),
    languages: state.seeker.languages.join(", "),
  });
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState<CvSection>(state.cv);

  const current = questions[step]!;

  const runAi = async () => {
    setLoading(true);
    try {
      const result = (await generateCv({
        data: {
          fullName: state.seeker.fullName,
          email: state.seeker.email,
          phone: state.seeker.phone,
          location: state.seeker.location,
          targetRole: answers.targetRole,
          education: answers.education,
          experience: answers.experience,
          skills: answers.skills,
          projects: answers.projects,
          certifications: answers.certifications,
          languages: answers.languages,
        },
      })) as CvSection | null;

      if (!result || !result.personal) throw new Error("empty");
      set({ cv: result, cvSource: "ai", targetRole: answers.targetRole });
      toast.success("Your CV is ready.");
      navigate({ to: "/app/cv" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      toast.error(
        /credits|busy/i.test(msg)
          ? msg
          : "The AI could not generate your CV right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell variant="seeker" title="CV Builder">
      <PageHeader
        title="Let's create your CV"
        subtitle="Add your information and let AI build a professional CV for you."
      />

      {mode === "choose" && (
        <div className="grid gap-3 lg:grid-cols-3">
          <Choice
            icon={<Sparkles className="h-5 w-5" />}
            title="Create with AI"
            badge="Recommended"
            body="Answer a few short questions and AI writes a professional CV for you."
            onClick={() => setMode("ai")}
          />
          <Choice
            icon={<FileUp className="h-5 w-5" />}
            title="Upload your CV"
            body="Upload an existing PDF, DOC or DOCX and keep using Talento matching."
            onClick={() => document.getElementById("cv-upload")?.click()}
          />
          <Choice
            icon={<PencilLine className="h-5 w-5" />}
            title="Create manually"
            body="Fill in your information step by step and keep full control."
            onClick={() => setMode("manual")}
          />
          <input
            id="cv-upload"
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              set({ cvSource: "upload" });
              toast.success(`${file.name} uploaded.`);
              navigate({ to: "/app/cv" });
            }}
          />
        </div>
      )}

      {mode === "ai" && (
        <div className="surface mx-auto max-w-2xl p-5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <AiBadge /> Question {step + 1} of {questions.length}
            </p>
            <Button variant="ghost" size="sm" onClick={() => setMode("choose")}>
              Cancel
            </Button>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="answer">{current.label}</Label>
            <Textarea
              id="answer"
              rows={4}
              value={answers[current.key]}
              placeholder={current.placeholder}
              onChange={(e) => setAnswers({ ...answers, [current.key]: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Write freely — the AI will structure and improve the wording.
            </p>
          </div>

          <div className="mt-5 flex gap-2">
            {step > 0 && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setStep(step - 1)}
                disabled={loading}
                aria-label={t("Back")}
              >
                <PreviousIcon className="h-4 w-4" />
              </Button>
            )}
            {step < questions.length - 1 ? (
              <Button
                className="flex-1"
                onClick={() => {
                  if (!answers[current.key].trim()) {
                    toast.error("Please answer this question before continuing.");
                    return;
                  }
                  setStep(step + 1);
                }}
              >
                Continue
              </Button>
            ) : (
              <Button className="flex-1" onClick={runAi} disabled={loading}>
                {loading ? "Generating your CV…" : "Generate my CV"}
              </Button>
            )}
          </div>
        </div>
      )}

      {mode === "manual" && (
        <div className="surface mx-auto max-w-2xl space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Edit every section</h2>
            <Button variant="ghost" size="icon" onClick={() => setMode("choose")} aria-label={t("Back")}>
              <PreviousIcon className="h-4 w-4" />
            </Button>
          </div>

          <Field
            label="Full name"
            value={manual.personal.fullName}
            onChange={(v) =>
              setManual({ ...manual, personal: { ...manual.personal, fullName: v } })
            }
          />
          <Field
            label="Professional title"
            value={manual.personal.title}
            onChange={(v) => setManual({ ...manual, personal: { ...manual.personal, title: v } })}
          />
          <div className="space-y-1.5">
            <Label htmlFor="summary">Professional summary</Label>
            <Textarea
              id="summary"
              rows={4}
              value={manual.personal.summary}
              onChange={(e) =>
                setManual({ ...manual, personal: { ...manual.personal, summary: e.target.value } })
              }
            />
          </div>
          <Field
            label="Skills (comma separated)"
            value={manual.skills.join(", ")}
            onChange={(v) =>
              setManual({ ...manual, skills: v.split(",").map((s) => s.trim()).filter(Boolean) })
            }
          />
          <Field
            label="Certifications (comma separated)"
            value={manual.certifications.join(", ")}
            onChange={(v) =>
              setManual({
                ...manual,
                certifications: v.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
          />
          <Field
            label="Languages (comma separated)"
            value={manual.languages.join(", ")}
            onChange={(v) =>
              setManual({ ...manual, languages: v.split(",").map((s) => s.trim()).filter(Boolean) })
            }
          />

          <Button
            className="w-full"
            onClick={() => {
              if (!manual.personal.fullName.trim() || manual.skills.length < 3) {
                toast.error("Add your name and at least 3 skills.");
                return;
              }
              set({ cv: manual, cvSource: "manual" });
              toast.success("CV saved.");
              navigate({ to: "/app/cv" });
            }}
          >
            Save CV
          </Button>
        </div>
      )}
    </AppShell>
  );
}

function Choice({
  icon,
  title,
  body,
  badge,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="surface p-5 text-left transition-shadow hover:shadow-lg">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
        {icon}
      </span>
      <span className="mt-3 flex items-center gap-2 font-semibold">
        {title}
        {badge && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
            {badge}
          </span>
        )}
      </span>
      <span className="mt-1 block text-sm text-muted-foreground">{body}</span>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={label}>{label}</Label>
      <Input id={label} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
