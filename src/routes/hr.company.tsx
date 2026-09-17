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
  const [member, setMember] = useState({ name: "", role: "", email: "" });
  const [error, setError] = useState<string | null>(null);

  const initials = form.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <AppShell variant="employer" title="Company profile">
      <PageHeader title="Company profile" subtitle="This is what candidates see on your job posts." />

      <div className="surface mb-4 flex items-center gap-4 p-5">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
          {initials || "T"}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-bold">{form.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {form.industry} · {form.size} · {form.location}
          </p>
        </div>
      </div>

      <div className="surface space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Industry" value={form.industry} onChange={(v) => setForm({ ...form, industry: v })} />
          <Field label="Company size" value={form.size} onChange={(v) => setForm({ ...form, size: v })} />
          <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
          <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">Hiring team</p>
          <div className="space-y-2">
            {form.team.map((t) => (
              <div key={t.email} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
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

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <Input
              placeholder="Name"
              aria-label="Team member name"
              value={member.name}
              onChange={(e) => setMember({ ...member, name: e.target.value })}
            />
            <Input
              placeholder="Role"
              aria-label="Team member role"
              value={member.role}
              onChange={(e) => setMember({ ...member, role: e.target.value })}
            />
            <Input
              placeholder="Email"
              aria-label="Team member email"
              value={member.email}
              onChange={(e) => setMember({ ...member, email: e.target.value })}
            />
          </div>
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              if (!member.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
                setError("Add a name and a valid email address.");
                return;
              }
              setError(null);
              setForm({ ...form, team: [...form.team, member] });
              setMember({ name: "", role: "", email: "" });
            }}
          >
            <Plus className="mr-1 h-4 w-4" /> Add team member
          </Button>
        </div>

        <Button
          onClick={() => {
            if (form.name.trim().length < 2) {
              toast.error("Company name is required.");
              return;
            }
            set({ company: form });
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
    <div className="space-y-1.5">
      <Label htmlFor={label}>{label}</Label>
      <Input id={label} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
