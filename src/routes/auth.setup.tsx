import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthLayout } from "./auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SKILL_LIBRARY } from "@/lib/data";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/auth/setup")({
  head: () => ({
    meta: [
      { title: "Complete your profile — Talento" },
      { name: "description", content: "Set up your Talento profile so matching works from day one." },
      { property: "og:title", content: "Complete your profile — Talento" },
      { property: "og:description", content: "A few details unlock your matches." },
    ],
  }),
  component: Setup,
});

function Setup() {
  const { state, set, hydrated } = useStore();
  const navigate = useNavigate();
  const role = state.session?.role ?? state.pendingRole ?? "seeker";
  const [seeker, setSeeker] = useState(state.seeker);
  const [company, setCompany] = useState(state.company);
  const [errors, setErrors] = useState<{ a?: string; b?: string }>({});

  useEffect(() => {
    if (hydrated && !state.session) navigate({ to: "/auth/role" });
  }, [hydrated, state.session, navigate]);

  const toggleSkill = (skill: string) =>
    setSeeker((s) => ({
      ...s,
      skills: s.skills.includes(skill)
        ? s.skills.filter((x) => x !== skill)
        : [...s.skills, skill],
    }));

  const finish = () => {
    if (role === "seeker") {
      const next: { a?: string; b?: string } = {};
      if (!seeker.university.trim()) next.a = "University is required.";
      if (seeker.skills.length < 3) next.b = "Pick at least 3 skills.";
      setErrors(next);
      if (Object.keys(next).length) return;
      set({ seeker });
      toast.success("Profile ready. Welcome to Talento!");
      navigate({ to: "/app" });
    } else {
      const next: { a?: string; b?: string } = {};
      if (!company.name.trim()) next.a = "Company name is required.";
      setErrors(next);
      if (Object.keys(next).length) return;
      set({ company });
      toast.success("Company profile ready.");
      navigate({ to: "/hr" });
    }
  };

  return (
    <AuthLayout
      title={role === "seeker" ? "Tell us about you" : "Tell us about your company"}
      subtitle="This powers your matches. You can change everything later."
      step="Step 4 of 4"
    >
      {role === "seeker" ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Row label="University" value={seeker.university} onChange={(v) => setSeeker({ ...seeker, university: v })} />
            <Row label="Major" value={seeker.major} onChange={(v) => setSeeker({ ...seeker, major: v })} />
            <Row label="Degree" value={seeker.degree} onChange={(v) => setSeeker({ ...seeker, degree: v })} />
            <Row label="GPA" value={seeker.gpa} onChange={(v) => setSeeker({ ...seeker, gpa: v })} />
            <Row label="Location" value={seeker.location} onChange={(v) => setSeeker({ ...seeker, location: v })} />
            <Row
              label="Years of experience"
              value={String(seeker.years)}
              onChange={(v) => setSeeker({ ...seeker, years: Number(v) || 0 })}
            />
          </div>
          {errors.a && <p className="text-xs text-destructive">{errors.a}</p>}

          <div>
            <Label className="mb-2 block">Your skills</Label>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_LIBRARY.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    seeker.skills.includes(s)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {errors.b && <p className="mt-2 text-xs text-destructive">{errors.b}</p>}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Row label="Company name" value={company.name} onChange={(v) => setCompany({ ...company, name: v })} />
          <Row label="Industry" value={company.industry} onChange={(v) => setCompany({ ...company, industry: v })} />
          <Row label="Company size" value={company.size} onChange={(v) => setCompany({ ...company, size: v })} />
          <Row label="Website" value={company.website} onChange={(v) => setCompany({ ...company, website: v })} />
          <Row label="Location" value={company.location} onChange={(v) => setCompany({ ...company, location: v })} />
          <div className="space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              rows={4}
              value={company.description}
              onChange={(e) => setCompany({ ...company, description: e.target.value })}
            />
          </div>
          {errors.a && <p className="text-xs text-destructive">{errors.a}</p>}
        </div>
      )}

      <Button className="mt-6 w-full" onClick={finish}>
        Finish setup
      </Button>
    </AuthLayout>
  );
}

function Row({
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
