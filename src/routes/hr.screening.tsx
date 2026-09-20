import { createFileRoute } from "@tanstack/react-router";
import { FileSearch, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AiBadge, EmptyState } from "@/components/brand";
import { SkillChips } from "@/components/match";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ScreenedCv } from "@/lib/ai.functions";
import { screenCv } from "@/lib/ai.functions";
import { CvExtractError, extractCvText } from "@/lib/cv-extract";

export const Route = createFileRoute("/hr/screening")({
  head: () => ({
    meta: [
      { title: "AI CV screening — Talento" },
      {
        name: "description",
        content: "Upload CVs and Talento extracts education, skills, experience and certifications.",
      },
      { property: "og:title", content: "AI CV screening — Talento" },
      { property: "og:description", content: "Turn a pile of CVs into structured profiles." },
    ],
  }),
  component: Screening,
});

type Extracted = ScreenedCv;

interface Row {
  id: string;
  fileName: string;
  status: "processing" | "done" | "error";
  step?: string;
  error?: string;
  data?: Extracted;
}

function Screening() {
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    const seeds: Row[] = list.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      fileName: f.name,
      status: "processing" as const,
      step: "Reading file…",
    }));
    setRows((r) => [...seeds, ...r]);

    const update = (id: string, patch: Partial<Row>) =>
      setRows((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));

    await Promise.all(
      list.map(async (file, i) => {
        const row = seeds[i]!;
        try {
          const text = await extractCvText(file);
          update(row.id, { step: "Analysing with AI…" });
          const data = (await screenCv({
            data: { text, fileName: file.name },
          })) as Extracted | null;
          if (!data) throw new Error("The AI returned no result. Please try again.");
          update(row.id, { status: "done", data, step: undefined, error: undefined });
        } catch (err) {
          const message =
            err instanceof CvExtractError
              ? err.message
              : err instanceof Error && err.message
                ? err.message
                : "Screening failed. Please try again.";
          update(row.id, { status: "error", error: message, step: undefined });
          toast.error(`${file.name}: ${message}`);
        }
      }),
    );
  };

  const visible = rows.filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const d = r.data;
    return (
      r.fileName.toLowerCase().includes(q) ||
      d?.name?.toLowerCase().includes(q) ||
      d?.university?.toLowerCase().includes(q) ||
      d?.major?.toLowerCase().includes(q) ||
      d?.skills?.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <AppShell variant="employer" title="AI CV screening">
      <PageHeader
        title="AI CV screening"
        subtitle="Upload several CVs at once and get structured, searchable profiles."
      />

      <section className="surface p-6 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <Upload className="h-5 w-5" />
        </div>
        <p className="mt-3 flex items-center justify-center gap-2 font-semibold">
          <AiBadge /> Upload CVs
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          PDF, DOC, DOCX or TXT. Multiple files supported.
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={(e) => {
            void handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Button className="mt-4" onClick={() => inputRef.current?.click()}>
          Choose files
        </Button>
      </section>

      {rows.length > 0 && (
        <div className="mt-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search extracted CVs by name, university, major or skill"
            aria-label="Search extracted CVs"
          />
        </div>
      )}

      <section className="mt-4 space-y-3">
        {rows.length === 0 && (
          <EmptyState
            icon={<FileSearch className="h-6 w-6" />}
            title="No CVs screened yet"
            body="Upload a batch of CVs and Talento will extract education, university, GPA, skills, experience, projects, certifications and languages."
          />
        )}

        {visible.map((r) => (
          <article key={r.id} className="surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{r.data?.name ?? r.fileName}</p>
                <p className="truncate text-xs text-muted-foreground">{r.fileName}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    r.status === "done"
                      ? "bg-success/10 text-success"
                      : r.status === "error"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {r.status === "done" ? "Extracted" : r.status === "error" ? "Failed" : "Processing"}
                </span>
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {r.status === "processing" && (
              <div className="mt-3 space-y-2">
                <div className="h-3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
              </div>
            )}

            {r.status === "error" && (
              <p className="mt-2 text-sm text-muted-foreground">
                This file could not be read as text. Export it as a text-based PDF or TXT and try
                again.
              </p>
            )}

            {r.status === "done" && r.data && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-muted-foreground">{r.data.summary}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Row2 label="Education" value={`${r.data.degree ?? "—"} in ${r.data.major ?? "—"}`} />
                  <Row2 label="University" value={r.data.university} />
                  <Row2 label="GPA" value={r.data.gpa} />
                  <Row2 label="Graduation" value={r.data.graduationYear?.toString()} />
                  <Row2 label="Experience" value={`${r.data.years ?? 0} years`} />
                  <Row2 label="Location" value={r.data.location} />
                </div>
                {!!r.data.skills?.length && (
                  <div>
                    <p className="text-xs font-semibold">Skills</p>
                    <SkillChips skills={r.data.skills} />
                  </div>
                )}
                {!!r.data.certifications?.length && (
                  <div>
                    <p className="text-xs font-semibold">Certifications</p>
                    <SkillChips skills={r.data.certifications} />
                  </div>
                )}
                {!!r.data.projects?.length && (
                  <div>
                    <p className="text-xs font-semibold">Projects</p>
                    {r.data.projects.map((p) => (
                      <p key={p.name} className="text-xs text-muted-foreground">
                        {p.name} — {p.description}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </article>
        ))}
      </section>
    </AppShell>
  );
}

function Row2({ label, value }: { label: string; value?: string | undefined }) {
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm">{value && value.trim() ? value : "Not found"}</p>
    </div>
  );
}
