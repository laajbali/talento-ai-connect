import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/auth/")({
  head: () => ({
    meta: [
      { title: "Log in — Talento" },
      { name: "description", content: "Log in to your Talento job seeker or employer account." },
      { property: "og:title", content: "Log in — Talento" },
      { property: "og:description", content: "Access your Talento account." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { set } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("seeker");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setTimeout(() => {
      set({
        session: {
          name: role === "seeker" ? "Sarah Ahmed" : "Noura Al Harbi",
          email,
          role,
          verified: true,
        },
      });
      navigate({ to: role === "seeker" ? "/app" : "/hr" });
    }, 600);
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue your journey with Talento.">
      <form onSubmit={submit} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          {(["seeker", "employer"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                role === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {r === "seeker" ? "Job Seeker" : "Employer / HR"}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            aria-invalid={!!errors.password}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Talento?{" "}
        <Link to="/auth/role" className="font-semibold text-primary">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
