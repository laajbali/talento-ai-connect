import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Briefcase, Building2, Check } from "lucide-react";
import { useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { defaultCompany, defaultSeeker } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

export const Route = createFileRoute("/auth/role")({
  head: () => ({
    meta: [
      { title: "Choose your role — Talento" },
      {
        name: "description",
        content: "Join Talento as a job seeker or as an employer / HR team.",
      },
      { property: "og:title", content: "Choose your role — Talento" },
      { property: "og:description", content: "Pick the Talento experience built for you." },
    ],
  }),
  component: ChooseRole,
});

const options: { role: Role; title: string; body: string; icon: React.ReactNode }[] = [
  {
    role: "seeker",
    title: "Job Seeker",
    body: "Find opportunities, build your CV, and grow your career with AI guidance.",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    role: "employer",
    title: "Employer / HR",
    body: "Find top talent, simplify hiring, and build your team with AI matching.",
    icon: <Building2 className="h-5 w-5" />,
  },
];

function ChooseRole() {
  const { state, set } = useStore();
  const { t, dir } = useI18n();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(state.pendingRole);

  return (
    <AuthLayout title="Choose your role" subtitle="Choose a demo role or create a real account.">
      <div className="space-y-3">
        {options.map((o) => (
          <button
            key={o.role}
            type="button"
            onClick={() => setRole(o.role)}
            aria-pressed={role === o.role}
            className={`flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left transition-colors ${
              role === o.role ? "border-primary bg-accent" : "border-border hover:border-primary/40"
            }`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              {o.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 font-semibold">
                {t(o.title)}
                {role === o.role && <Check className="h-4 w-4 text-primary" />}
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">{t(o.body)}</span>
            </span>
          </button>
        ))}
      </div>

      <Button
        className="mt-6 w-full"
        disabled={!role}
        onClick={() => {
          if (!role) return;
          const name = role === "seeker" ? defaultSeeker.fullName : defaultCompany.team[0]?.name || "HR Manager";
          set({
            pendingRole: role,
            session: {
              name,
              email: role === "seeker" ? defaultSeeker.email : defaultCompany.team[0]?.email || "hr@talento.sa",
              role,
              verified: true,
            },
          });
          navigate({ to: role === "seeker" ? "/app" : "/hr" });
        }}
      >
        {t("Enter Demo")} {dir === "rtl" ? <ArrowRight className="mr-1 h-4 w-4 rotate-180" /> : <ArrowRight className="ml-1 h-4 w-4" />}
      </Button>
      {!role && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Select a role to continue.
        </p>
      )}
      <Button
        variant="outline"
        className="mt-2 w-full"
        disabled={!role}
        onClick={() => {
          set({ pendingRole: role });
          navigate({ to: "/auth/signup" });
        }}
      >
        {t("Create an account")}
      </Button>
    </AuthLayout>
  );
}
