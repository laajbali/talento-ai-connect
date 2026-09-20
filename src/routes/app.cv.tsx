import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Download, Eye, FileText, Pencil, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AiBadge, MatchRing } from "@/components/brand";
import { CV_DOC_WIDTH, CvDocument } from "@/components/cv-templates";
import { SkillChips } from "@/components/match";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CV_TEMPLATES } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { downloadNodeAsPdf } from "@/lib/pdf";
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
  const { t } = useI18n();
  const cv = state.cv;
  const pct = cvCompletion(cv);
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLDivElement>(null);

  const download = async () => {
    if (!docRef.current) return;
    setBusy(true);
    toast.info(t("Preparing your PDF…"));
    try {
      await downloadNodeAsPdf(
        docRef.current,
        `${cv.personal.fullName.replace(/\s+/g, "-")}-CV-${state.cvTemplate}.pdf`,
      );
      toast.success(t("CV downloaded."));
    } catch {
      toast.error(t("We could not create the PDF. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell variant="seeker" title="My CV">
      <PageHeader
        title="My CV"
        subtitle="Create, edit and manage your professional CV."
        action={
          <Button asChild size="sm">
            <Link to="/app/cv-builder">
              <Pencil className="mr-1 h-4 w-4" /> {t("Edit CV")}
            </Link>
          </Button>
        }
      />

      <section className="surface grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <AiBadge /> {state.cvSource === "upload" ? t("Uploaded CV") : t("AI-generated CV")}
          </p>
          <h2 className="mt-1 truncate text-lg font-bold" data-no-translate>{cv.personal.fullName}</h2>
          <p className="truncate text-sm text-muted-foreground">{cv.personal.title}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("Template")}: {t(CV_TEMPLATES.find((x) => x.id === state.cvTemplate)?.name ?? "")}
          </p>
        </div>
        <MatchRing value={pct} label={t("Complete")} size={90} />
      </section>

      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        <Button variant="outline" onClick={() => setPreview(true)}>
          <Eye className="mr-1 h-4 w-4" /> {t("Preview")}
        </Button>
        <Button variant="outline" onClick={download} disabled={busy}>
          <Download className="mr-1 h-4 w-4" /> {t("Download PDF")}
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload className="mr-1 h-4 w-4" /> {t("Upload new CV")}
        </Button>
        <Button asChild>
          <Link to="/app/cv-builder">
            <FileText className="mr-1 h-4 w-4" /> {t("Open builder")}
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
        <Block title={t("Personal information")}>
          <p className="text-sm">{cv.personal.summary}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {cv.personal.email} · {cv.personal.phone} · {cv.personal.location}
          </p>
        </Block>
        <Block title={t("Education")}>
          {cv.education.map((e) => (
            <div key={e.degree} className="text-sm">
              <p className="font-medium">{e.degree}</p>
              <p className="text-xs text-muted-foreground">
                {e.school} · {e.period} · GPA {e.gpa}
              </p>
            </div>
          ))}
        </Block>
        <Block title={t("Skills")}>
          <SkillChips skills={cv.skills} />
        </Block>
        <Block title={t("Experience")}>
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
            <p className="text-sm text-muted-foreground">{t("No experience added yet.")}</p>
          )}
        </Block>
        <Block title={t("Projects")}>
          {cv.projects.map((p) => (
            <div key={p.name} className="text-sm">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.description}</p>
            </div>
          ))}
        </Block>
        <Block title={t("Certifications & languages")}>
          <SkillChips skills={[...cv.certifications, ...cv.languages]} />
        </Block>
      </section>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">{t("CV templates")}</h2>
        <div className="grid gap-4 sm:grid-cols-3 sm:gap-3">
          {CV_TEMPLATES.map((tpl) => {
            const selected = state.cvTemplate === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                aria-pressed={selected}
                onClick={() => {
                  set({ cvTemplate: tpl.id });
                  toast.success(`${t(tpl.name)} — ${t("Selected")}`);
                }}
                className={`surface group min-w-0 overflow-hidden p-3 text-start transition-colors sm:p-4 ${
                  selected ? "ring-2 ring-primary" : ""
                }`}
              >
                <CvTemplatePreview cv={cv} template={tpl.id} />
                <p className="mt-3 flex items-center gap-1.5 font-semibold">
                  {t(tpl.name)}
                  {selected && <Check className="h-4 w-4 text-primary" />}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{tpl.description}</p>
                <span className="mt-3 flex min-h-10 w-full items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm sm:min-h-9">
                  {selected ? t("Selected") : t("Use this template")}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-auto">
          <DialogHeader>
            <DialogTitle>{t("CV preview")}</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <div className="mx-auto w-fit rounded-xl border border-border shadow-sm">
              <CvDocument cv={cv} template={state.cvTemplate} scale={0.75} />
            </div>
          </div>
          <Button onClick={download} disabled={busy} className="mt-3">
            <Download className="mr-1 h-4 w-4" /> {t("Download PDF")}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Off-screen full-size document used for the PDF export */}
      <div aria-hidden className="pointer-events-none fixed -left-[3000px] top-0 -z-10">
        <CvDocument ref={docRef} cv={cv} template={state.cvTemplate} forExport />
      </div>
    </AppShell>
  );
}

function CvTemplatePreview({ cv, template }: { cv: typeof import("@/lib/data").SEEKER_CV; template: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.28);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const resize = () => setScale(frame.clientWidth / CV_DOC_WIDTH);
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={frameRef}
      className="aspect-[794/520] w-full overflow-hidden rounded-md border border-border bg-card sm:h-40 sm:aspect-auto"
    >
      <div className="pointer-events-none">
        <CvDocument cv={cv} template={template} scale={scale} />
      </div>
    </div>
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
