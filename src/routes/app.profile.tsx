import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { MatchRing } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SKILL_LIBRARY } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { profileCompletion, useStore } from "@/lib/store";

export const Route = createFileRoute("/app/profile")({
  head: () => ({
    meta: [
      { title: "Personal information — Talento" },
      { name: "description", content: "Update your education, skills and contact details." },
      { property: "og:title", content: "Personal information — Talento" },
      { property: "og:description", content: "Keep your profile accurate for better matches." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { state, set } = useStore();
  const { t } = useI18n();
  const [form, setForm] = useState(state.seeker);
  const [errors, setErrors] = useState<{ email?: string; name?: string }>({});
  const pct = profileCompletion(form);
  const dirty = JSON.stringify(form) !== JSON.stringify(state.seeker);

  const save = () => {
    const next: { email?: string; name?: string } = {};
    if (form.fullName.trim().length < 3) next.name = t("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = t("Enter a valid email.");
    setErrors(next);
    if (Object.keys(next).length) return;
    set({
      seeker: form,
      cv: {
        ...state.cv,
        personal: {
          ...state.cv.personal,
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          location: form.location,
        },
      },
    });
    toast.success(t("Your information was saved successfully."));
  };

  return (
    <AppShell variant="seeker" title="Personal information">
      <PageHeader title="Personal information" subtitle="This information powers your matching." />

      <div className="surface mb-4 flex items-center gap-4 p-5">
        <MatchRing value={pct} label={t("Complete")} size={84} />
        <div>
          <p className="font-semibold" data-no-translate>{form.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {form.major} · {form.university}
          </p>
        </div>
      </div>

      <div className="surface space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("Full name")} value={form.fullName} error={errors.name} onChange={(v) => setForm({ ...form, fullName: v })} />
          <Field label={t("Email")} value={form.email} error={errors.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label={t("Phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label={t("Location")} value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <Field label={t("Degree")} value={form.degree} onChange={(v) => setForm({ ...form, degree: v })} />
          <Field label={t("Major")} value={form.major} onChange={(v) => setForm({ ...form, major: v })} />
          <Field label={t("University")} value={form.university} onChange={(v) => setForm({ ...form, university: v })} />
          <Field label={t("GPA")} value={form.gpa} onChange={(v) => setForm({ ...form, gpa: v })} />
          <Field
            label={t("Graduation year")}
            value={String(form.graduationYear)}
            onChange={(v) => setForm({ ...form, graduationYear: Number(v) || form.graduationYear })}
          />
          <Field
            label={t("Years of experience")}
            value={String(form.years)}
            onChange={(v) => setForm({ ...form, years: Number(v) || 0 })}
          />
          <Field
            label={t("Certifications (comma separated)")}
            value={form.certifications.join(", ")}
            onChange={(v) =>
              setForm({ ...form, certifications: v.split(",").map((s) => s.trim()).filter(Boolean) })
            }
          />
          <Field
            label={t("Languages (comma separated)")}
            value={form.languages.join(", ")}
            onChange={(v) =>
              setForm({ ...form, languages: v.split(",").map((s) => s.trim()).filter(Boolean) })
            }
          />
        </div>

        <div>
          <Label className="mb-2 block">{t("Skills")}</Label>
          <div className="flex flex-wrap gap-1.5">
            {SKILL_LIBRARY.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() =>
                  setForm({
                    ...form,
                    skills: form.skills.includes(s)
                      ? form.skills.filter((x) => x !== s)
                      : [...form.skills, s],
                  })
                }
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  form.skills.includes(s)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky bottom-20 z-10 mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background/95 p-3 backdrop-blur lg:bottom-4">
        <Button onClick={save} disabled={!dirty}>
          {t("Save changes")}
        </Button>
        {dirty && (
          <>
            <Button variant="outline" onClick={() => setForm(state.seeker)}>
              {t("Discard changes")}
            </Button>
            <span className="text-xs text-muted-foreground">{t("You have unsaved changes.")}</span>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={label}>{label}</Label>
      <Input id={label} value={value} aria-invalid={!!error} onChange={(e) => onChange(e.target.value)} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
