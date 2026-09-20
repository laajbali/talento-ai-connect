import { createFileRoute } from "@tanstack/react-router";
import { FileSearch, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AiBadge, EmptyState } from "@/components/brand";
import { SkillChips } from "@/components/match";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { screenCv } from "@/lib/ai.functions";

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

interface Extracted {
  name?: string;
  title?: string;
  degree?: string;
  major?: string;
  university?: string;
  gpa?: string;
  graduationYear?: number | null;
  location?: string;
  years?: number;
  skills?: string[];
  certifications?: string[];
  languages?: string[];
  projects?: { name: string; description: string }[];
  summary?: string;
}

interface Row {
  id: string;
  fileName: string;
  status: "processing" | "done" | "error";
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
      status: "processing",
    }));
    setRows((r) => [...seeds, ...r]);

    for (const [i, file] of list.entries()) {
      const row = seeds[i]!;
      try {
        const text = await file.text();
        const usable = text.replace(/[^\x20-\x7E\n]/g, " ").trim();
        if (usable.length < 20) throw new Error("unreadable");
        const data = (await screenCv({
          data: { text: usable, fileName: file.name },
        })) as Extracted | null;
        if (!data) throw new Error("empty");
        setRows((r) => r.map((x) => (x.id === row.id ? { ...x, status: "done", data } : x)));
      } catch {
        setRows((r) => r.map((x) => (x.id === row.id ? { ...x, status: "error" } : x)));
        toast.error(`Could not read ${file.name}. Text-based PDF, DOC or TXT works best.`);
      }
    }
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

      <section className="surface p-5 text-center">
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
