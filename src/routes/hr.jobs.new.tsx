import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AiBadge } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { demoEngine } from "@/lib/demo-engine";
import { useStore } from "@/lib/store";
import type { Job } from "@/lib/types";

export const Route = createFileRoute("/hr/jobs/new")({
  head: () => ({
    meta: [
      { title: "AI job posting — Talento" },
      {
        name: "description",
        content: "Enter the essentials and Talento writes a professional job description.",
      },
      { property: "og:title", content: "AI job posting — Talento" },
      { property: "og:description", content: "Publish a polished job post in minutes." },
    ],
  }),
  component: NewJob,
});

interface Written {
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  preferredSkills: string[];
}

function NewJob() {
  const { state, update } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    notes: "",
    location: "Riyadh, Saudi Arabia",
    type: "Full-time",
    level: "Entry level",
    salary: "",
    education: "Bachelor's degree",
    skills: "",
    experience: "0-2 years",
    certifications: "",
  });
  const [draft, setDraft] = useState<Written | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [errors, setErrors] = useState<{ title?: string; skills?: string }>({});

  const validate = () => {
    const e: { title?: string; skills?: string } = {};
    if (form.title.trim().length < 3) e.title = "Enter a job title.";
    if (form.skills.trim().length < 2) e.skills = "List at least one required skill.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const generate = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = (await demoEngine.generateJobPost(
        {
          title: form.title,
          notes: form.notes,
          location: form.location,
          type: form.type,
          education: form.education,
          skills: form.skills,
          experience: form.experience,
          certifications: form.certifications,
          level: form.level,
          company: state.company.name,
        },
        setStep,
      )) as Written | null;
      if (!result?.description) throw new Error("empty");
      setDraft(result);
      toast.success("Job description generated. Review and edit before publishing.");
    } catch {
      toast.error("Couldn't generate the description. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const save = (status: "Active" | "Draft") => {
    if (!validate()) return;
    const listed = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const job: Job = {
      id: `job-${Date.now()}`,
      title: form.title,
      company: state.company.name,
      companyLogo: state.company.name.slice(0, 2).toUpperCase(),
      location: form.location,
      type: form.type as Job["type"],
      level: form.level as Job["level"],
      ...(form.salary ? { salary: form.salary } : {}),
      posted: "just now",
      description: draft?.description ?? form.notes,
      responsibilities: draft?.responsibilities ?? [],
      requirements: draft?.requirements ?? [],
      skills: draft?.skills?.length ? draft.skills : listed,
      preferredSkills: draft?.preferredSkills ?? [],
      education: form.education,
      minYears: Number(form.experience.match(/\d+/)?.[0] ?? 0),
      certifications: form.certifications
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      status,
      applicants: 0,
      shortlisted: 0,
      interviews: 0,
      hired: 0,
    };
    update((s) => ({ ...s, jobs: [job, ...s.jobs] }));
    toast.success(status === "Active" ? "Job published." : "Draft saved.");
    navigate({ to: "/hr/jobs" });
  };

  return (
    <AppShell variant="employer" title="Post a job">
      <PageHeader title="AI job posting" subtitle="Give the essentials — Talento writes the rest." />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="surface space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">Job title</Label>
            <Input
              id="title"
              value={form.title}
              aria-invalid={!!errors.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Data Analyst"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">What does this role do?</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Build dashboards for the commercial team, work with SQL and Power BI…"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="loc">Location</Label>
              <Input
                id="loc"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Employment type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger aria-label="Employment type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Full-time", "Part-time", "Internship", "Contract", "Remote"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Level</Label>
              <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                <SelectTrigger aria-label="Level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Entry level", "Mid level", "Senior"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="salary">Salary range</Label>
              <Input
                id="salary"
                value={form.salary}
                onChange={(e) => setForm({ ...form, salary: e.target.value })}
                placeholder="10,000 – 14,000 SAR"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edu">Required education</Label>
              <Input
                id="edu"
                value={form.education}
                onChange={(e) => setForm({ ...form, education: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="exp">Experience</Label>
              <Input
                id="exp"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="skills">Required skills (comma separated)</Label>
            <Input
              id="skills"
              value={form.skills}
              aria-invalid={!!errors.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
              placeholder="SQL, Power BI, Excel"
            />
            {errors.skills && <p className="text-xs text-destructive">{errors.skills}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="certs">Certifications (optional)</Label>
            <Input
              id="certs"
              value={form.certifications}
              onChange={(e) => setForm({ ...form, certifications: e.target.value })}
            />
          </div>

          <Button onClick={generate} disabled={loading} className="w-full">
            <AiBadge /> <span className="ml-2">{loading ? step || "Writing…" : "Generate with AI"}</span>
          </Button>
        </section>

        <section className="surface p-5">
          <h2 className="font-semibold">Preview</h2>
          {loading && (
            <div className="mt-3 space-y-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="h-3 animate-pulse rounded bg-muted" />
              ))}
            </div>
          )}
          {!loading && !draft && (
            <p className="mt-2 text-sm text-muted-foreground">
              Fill in the details and generate the description. You can edit every line before
              publishing.
            </p>
          )}
          {!loading && draft && (
            <div className="mt-3 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  rows={6}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>
              <EditList
                label="Responsibilities"
                items={draft.responsibilities}
                onChange={(responsibilities) => setDraft({ ...draft, responsibilities })}
              />
              <EditList
                label="Requirements"
                items={draft.requirements}
                onChange={(requirements) => setDraft({ ...draft, requirements })}
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => save("Active")}>Publish job</Button>
                <Button variant="outline" onClick={() => save("Draft")}>
                  Save as draft
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

function EditList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {items.map((item, i) => (
        <Input
          key={i}
          value={item}
          aria-label={`${label} ${i + 1}`}
          onChange={(e) => {
            const next = [...items];
            next[i] = e.target.value;
            onChange(next);
          }}
        />
      ))}
      <Button size="sm" variant="ghost" onClick={() => onChange([...items, ""])}>
        Add item
      </Button>
    </div>
  );
}
