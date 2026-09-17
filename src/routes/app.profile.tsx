import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { MatchRing } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SKILL_LIBRARY } from "@/lib/data";
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
  const [form, setForm] = useState(state.seeker);
  const [errors, setErrors] = useState<{ email?: string; name?: string }>({});
  const pct = profileCompletion(form);

  const save = () => {
    const next: { email?: string; name?: string } = {};
    if (form.fullName.trim().length < 3) next.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email.";
    setErrors(next);
    if (Object.keys(next).length) return;
    set({ seeker: form });
    toast.success("Profile updated.");
  };

  return (
    <AppShell variant="seeker" title="Personal information">
      <PageHeader title="Personal information" subtitle="This information powers your matching." />

      <div className="surface mb-4 flex items-center gap-4 p-5">
        <MatchRing value={pct} label="Complete" size={84} />
        <div>
          <p className="font-semibold">{form.fullName}</p>
          <p className="text-sm text-muted-foreground">
            {form.major} · {form.university}
          </p>
        </div>
      </div>

      <div className="surface space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" value={form.fullName} error={errors.name} onChange={(v) => setForm({ ...form, fullName: v })} />
          <Field label="Email" value={form.email} error={errors.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          <Field label="Degree" value={form.degree} onChange={(v) => setForm({ ...form, degree: v })} />
          <Field label="Major" value={form.major} onChange={(v) => setForm({ ...form, major: v })} />
          <Field label="University" value={form.university} onChange={(v) => setForm({ ...form, university: v })} />
          <Field label="GPA" value={form.gpa} onChange={(v) => setForm({ ...form, gpa: v })} />
          <Field
            label="Graduation year"
            value={String(form.graduationYear)}
            onChange={(v) => setForm({ ...form, graduationYear: Number(v) || form.graduationYear })}
          />
          <Field
            label="Years of experience"
            value={String(form.years)}
            onChange={(v) => setForm({ ...form, years: Number(v) || 0 })}
          />
          <Field
            label="Certifications (comma separated)"
            value={form.certifications.join(", ")}
            onChange={(v) =>
              setForm({ ...form, certifications: v.split(",").map((s) => s.trim()).filter(Boolean) })
            }
          />
          <Field
            label="Languages (comma separated)"
            value={form.languages.join(", ")}
            onChange={(v) =>
              setForm({ ...form, languages: v.split(",").map((s) => s.trim()).filter(Boolean) })
            }
          />
        </div>

        <div>
          <Label className="mb-2 block">Skills</Label>
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

        <Button onClick={save}>Save changes</Button>
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
