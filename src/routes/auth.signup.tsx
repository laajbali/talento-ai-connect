import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthLayout } from "./auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — Talento" },
      {
        name: "description",
        content: "Create a Talento account and join a community that builds brighter futures.",
      },
      { property: "og:title", content: "Create your account — Talento" },
      { property: "og:description", content: "Sign up for Talento in under a minute." },
    ],
  }),
  component: SignUp,
});

function SignUp() {
  const { state, set, hydrated } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && !state.pendingRole) navigate({ to: "/auth/role" });
  }, [hydrated, state.pendingRole, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) next.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setTimeout(() => {
      set({
        session: {
          name: form.name,
          email: form.email,
          role: state.pendingRole ?? "seeker",
          verified: false,
        },
        seeker: { ...state.seeker, fullName: form.name, email: form.email },
      });
      navigate({ to: "/auth/verify" });
    }, 600);
  };

  const social = (provider: string) => {
    set({
      session: {
        name: form.name || "Sarah Ahmed",
        email: form.email || `demo@${provider}.com`,
        role: state.pendingRole ?? "seeker",
        verified: true,
      },
    });
    navigate({ to: "/auth/setup" });
  };

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join a community that builds brighter futures."
      step="Step 2 of 4"
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field
          id="name"
          label="Full Name"
          value={form.name}
          error={errors.name}
          placeholder="Sarah Ahmed"
          onChange={(v) => setForm({ ...form, name: v })}
        />
        <Field
          id="email"
          label="Email"
          type="email"
          value={form.email}
          error={errors.email}
          placeholder="sarah@example.com"
          onChange={(v) => setForm({ ...form, email: v })}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          value={form.password}
          error={errors.password}
          placeholder="At least 8 characters"
          onChange={(v) => setForm({ ...form, password: v })}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or continue with{" "}
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-2">
        <Button variant="outline" className="w-full" onClick={() => social("google")}>
          Continue with Google
        </Button>
        <Button variant="outline" className="w-full" onClick={() => social("microsoft")}>
          Continue with Microsoft
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/auth" className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
