import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Eye, FileText, Pencil, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AiBadge, MatchRing } from "@/components/brand";
import { SkillChips } from "@/components/match";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CV_TEMPLATES } from "@/lib/data";
import { cvCompletion, useStore } from "@/lib/store";

export const Route = createFileRoute("/app/cv")({
  head: () => ({
    meta: [
      { title: "My CV — Talento" },
      {
        name: "description",
        content: "Manage your AI-generated CV: edit sections, change template, preview and download.",
      },
      { property: "og:title", content: "My CV — Talento" },
      { property: "og:description", content: "Your CV, always ready to send." },
    ],
  }),
  component: MyCv,
});

function MyCv() {
  const { state, set } = useStore();
  const cv = state.cv;
  const pct = cvCompletion(cv);
  const [preview, setPreview] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const download = () => {
    const text = [
      cv.personal.fullName,
      cv.personal.title,
      `${cv.personal.email} | ${cv.personal.phone} | ${cv.personal.location}`,
      "",
      "SUMMARY",
      cv.personal.summary,
      "",
      "EDUCATION",
      ...cv.education.map((e) => `${e.degree}, ${e.school} (${e.period}) GPA ${e.gpa}`),
      "",
      "SKILLS",
      cv.skills.join(", "),
      "",
      "EXPERIENCE",
      ...cv.experience.map((e) => `${e.role} — ${e.company} (${e.period}): ${e.summary}`),
      "",
      "PROJECTS",
      ...cv.projects.map((p) => `${p.name}: ${p.description}`),
      "",
      "CERTIFICATIONS",
      cv.certifications.join(", "),
      "",
      "LANGUAGES",
      cv.languages.join(", "),
    ].join("\n");
    const blob = new Blob([text], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cv.personal.fullName.replace(/\s+/g, "-")}-CV.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CV downloaded.");
  };

  return (
    <AppShell variant="seeker" title="My CV">
      <PageHeader
        title="My CV"
        subtitle="Create, edit and manage your professional CV."
        action={
          <Button asChild size="sm">
            <Link to="/app/cv-builder">
              <Pencil className="mr-1 h-4 w-4" /> Edit CV
            </Link>
          </Button>
        }
      />

      <section className="surface grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <AiBadge /> {state.cvSource === "upload" ? "Uploaded CV" : "AI-generated CV"}
          </p>
          <h2 className="mt-1 truncate text-lg font-bold">{cv.personal.fullName}</h2>
          <p className="truncate text-sm text-muted-foreground">{cv.personal.title}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Template: {CV_TEMPLATES.find((t) => t.id === state.cvTemplate)?.name}
          </p>
        </div>
        <MatchRing value={pct} label="Complete" size={90} />
      </section>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <Button variant="outline" onClick={() => setPreview(true)}>
          <Eye className="mr-1 h-4 w-4" /> Preview
        </Button>
        <Button variant="outline" onClick={download}>
          <Download className="mr-1 h-4 w-4" /> Download PDF
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload className="mr-1 h-4 w-4" /> Upload new CV
        </Button>
        <Button asChild>
          <Link to="/app/cv-builder">
            <FileText className="mr-1 h-4 w-4" /> Open builder
          </Link>
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 10 * 1024 * 1024) {
              toast.error("File must be under 10 MB.");
              return;
            }
            set({ cvSource: "upload" });
            toast.success(`${file.name} uploaded and linked to your profile.`);
          }}
        />
      </div>

      <section className="mt-6 grid gap-3 lg:grid-cols-2">
        <Block title="Personal information">
          <p className="text-sm">{cv.personal.summary}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {cv.personal.email} · {cv.personal.phone} · {cv.personal.location}
          </p>
        </Block>
        <Block title="Education">
          {cv.education.map((e) => (
            <div key={e.degree} className="text-sm">
              <p className="font-medium">{e.degree}</p>
              <p className="text-xs text-muted-foreground">
                {e.school} · {e.period} · GPA {e.gpa}
              </p>
            </div>
          ))}
        </Block>
        <Block title="Skills">
          <SkillChips skills={cv.skills} />
        </Block>
        <Block title="Experience">
          {cv.experience.length ? (
            cv.experience.map((e) => (
              <div key={e.role} className="text-sm">
                <p className="font-medium">
                  {e.role} — {e.company}
                </p>
                <p className="text-xs text-muted-foreground">{e.period}</p>
                <p className="mt-1 text-xs text-muted-foreground">{e.summary}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No experience added yet.</p>
          )}
        </Block>
        <Block title="Projects">
          {cv.projects.map((p) => (
            <div key={p.name} className="text-sm">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.description}</p>
            </div>
          ))}
        </Block>
        <Block title="Certifications & languages">
          <SkillChips skills={[...cv.certifications, ...cv.languages]} />
        </Block>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">CV templates</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {CV_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                set({ cvTemplate: t.id });
                toast.success(`${t.name} template applied.`);
              }}
              className={`surface p-4 text-left transition-colors ${
                state.cvTemplate === t.id ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="mb-3 h-20 rounded-lg bg-muted" />
              <p className="font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.description}</p>
            </button>
          ))}
        </div>
      </section>

      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>CV preview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 rounded-xl border border-border bg-card p-6 text-sm">
            <div className="border-b border-border pb-3">
              <h3 className="text-xl font-bold">{cv.personal.fullName}</h3>
              <p className="text-primary">{cv.personal.title}</p>
              <p className="text-xs text-muted-foreground">
                {cv.personal.email} · {cv.personal.phone} · {cv.personal.location}
              </p>
            </div>
            <p>{cv.personal.summary}</p>
            <Section title="Education">
              {cv.education.map((e) => (
                <p key={e.degree}>
                  <strong>{e.degree}</strong> — {e.school} ({e.period})
                </p>
              ))}
            </Section>
            <Section title="Experience">
              {cv.experience.map((e) => (
                <p key={e.role}>
                  <strong>{e.role}</strong>, {e.company} ({e.period}) — {e.summary}
                </p>
              ))}
            </Section>
            <Section title="Skills">
              <p>{cv.skills.join(" · ")}</p>
            </Section>
            <Section title="Projects">
              {cv.projects.map((p) => (
                <p key={p.name}>
                  <strong>{p.name}</strong> — {p.description}
                </p>
              ))}
            </Section>
            <Section title="Certifications">
              <p>{cv.certifications.join(" · ") || "—"}</p>
            </Section>
            <Section title="Languages">
              <p>{cv.languages.join(" · ")}</p>
            </Section>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface space-y-2 p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">{title}</p>
      <div className="space-y-1 text-sm">{children}</div>
    </div>
  );
}
