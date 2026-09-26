import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/hr/company")({
  head: () => ({
    meta: [
      { title: "Company profile — Talento" },
      { name: "description", content: "Manage your company details, branding and hiring team." },
      { property: "og:title", content: "Company profile — Talento" },
      { property: "og:description", content: "How candidates see your company." },
    ],
  }),
  component: Company,
});

function Company() {
  const { state, set } = useStore();
  const [form, setForm] = useState(state.company);
  type Draft = { id: number; name: string; role: string; email: string };
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftErrors, setDraftErrors] = useState<Record<number, string>>({});
  const [nextId, setNextId] = useState(1);
  const updateDraft = (id: number, patch: Partial<Draft>) => {
    setDrafts((d) => d.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    setDraftErrors((e) => {
      const { [id]: _omit, ...rest } = e;
      return rest;
    });
  };
  const validateDraft = (d: Draft): string | null => {
    const missing = [!d.name.trim() && "Name", !d.role.trim() && "Role", !d.email.trim() && "Email"].filter(Boolean);
    if (missing.length) return `${missing.join(", ")} ${missing.length > 1 ? "are" : "is"} required.`;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return "Enter a valid email address.";
    return null;
  };

  const initials = form.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppShell variant="employer" title="Company profile">
      <div className="[&_h1]:text-[22px] [&_h1]:leading-tight [&_h1]:font-bold [&_p]:text-[14px] [&_p]:leading-normal sm:[&_h1]:text-2xl sm:[&_p]:text-sm sm:[&_p]:font-normal">
        <PageHeader title="Company profile" subtitle="This is what candidates see on your job posts." />
      </div>

      <div className="surface mb-3 flex items-center gap-3 p-3 sm:mb-4 sm:gap-4 sm:p-5">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground sm:h-16 sm:w-16 sm:rounded-2xl sm:text-lg">
          {initials || "T"}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[17px] leading-tight font-semibold sm:text-lg sm:font-bold">{form.name}</p>
          <p className="truncate text-[13px] leading-snug text-muted-foreground sm:text-sm">
            {form.industry} · {form.size} · {form.location}
          </p>
        </div>
      </div>

      <div className="surface space-y-3 p-3 sm:space-y-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <Field label="Company name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />
          <Field label="Company size" value={form.size} onChange={(v) => setForm({ ...form, size: v })} />
          <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
          <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
        </div>
        <div className="space-y-1">
          <Label className="text-[14px] font-medium sm:text-sm" htmlFor="desc">Description</Label>
          <Textarea
            className="min-h-20 text-[15px] leading-5 font-normal sm:min-h-24 sm:text-base sm:leading-normal md:text-sm"
            id="desc"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div id="team" className="scroll-mt-24">
          <p className="mb-1.5 text-[16px] leading-tight font-semibold sm:mb-2 sm:text-sm">Hiring team</p>
          <div className="space-y-1.5 sm:space-y-2">
            {form.team.map((t) => (
              <div key={t.email} className="flex items-center gap-2 rounded-xl border border-border p-2.5 sm:gap-3 sm:p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium sm:text-sm">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground sm:text-xs">
                    {t.role} · {t.email}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${t.name}`}
                  onClick={() => setForm({ ...form, team: form.team.filter((x) => x.email !== t.email) })}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>

          {drafts.map((d) => (
            <div key={d.id} className="mt-2.5 sm:mt-3">
              <div className="flex items-start gap-2">
                <div className="grid flex-1 gap-1.5 sm:grid-cols-3 sm:gap-2">
              <Input
                className="h-9 text-[15px] font-normal sm:text-base md:text-sm"
                placeholder="Name"
                aria-label="Team member name"
                value={d.name}
                onChange={(e) => updateDraft(d.id, { name: e.target.value })}
              />
              <Input
                className="h-9 text-[15px] font-normal sm:text-base md:text-sm"
                placeholder="Role"
                aria-label="Team member role"
                value={d.role}
                onChange={(e) => updateDraft(d.id, { role: e.target.value })}
              />
              <Input
                className="h-9 text-[15px] font-normal sm:text-base md:text-sm"
                placeholder="Email"
                aria-label="Team member email"
                value={d.email}
                onChange={(e) => updateDraft(d.id, { email: e.target.value })}
              />
                </div>
                <button
                  type="button"
                  className="mt-2.5"
                  aria-label="Remove new team member"
                  onClick={() => setDrafts((x) => x.filter((y) => y.id !== d.id))}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              {draftErrors[d.id] && <p className="mt-1 text-xs text-destructive">{draftErrors[d.id]}</p>}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="mt-2 h-8 text-sm font-medium sm:text-xs"
            onClick={() => {
              setDrafts((d) => [...d, { id: nextId, name: "", role: "", email: "" }]);
              setNextId((n) => n + 1);
            }}
          >
            <Plus className="mr-1 h-4 w-4" /> Add team member
          </Button>
        </div>

        <Button
          className="h-8 text-sm font-medium sm:h-9 sm:text-sm"
          onClick={() => {
            if (form.name.trim().length < 2) {
              toast.error("Company name is required.");
              return;
            }
            const errs: Record<number, string> = {};
            for (const d of drafts) {
              const err = validateDraft(d);
              if (err) errs[d.id] = err;
            }
            setDraftErrors(errs);
            if (Object.keys(errs).length) {
              toast.error("Complete the new team member details.");
              return;
            }
            const added = drafts.map((d) => ({ name: d.name.trim(), role: d.role.trim(), email: d.email.trim() }));
            const next = { ...form, team: [...form.team, ...added] };
            setForm(next);
            setDrafts([]);
            set({ company: next });
            toast.success("Company profile saved.");
          }}
        >
          Save company profile
        </Button>
      </div>
    </AppShell>
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
    <div className="space-y-1">
      <Label className="text-[14px] font-medium sm:text-sm" htmlFor={label}>{label}</Label>
      <Input className="h-9 text-[15px] font-normal sm:text-base md:text-sm" id={label} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
