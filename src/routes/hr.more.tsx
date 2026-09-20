import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  Building2,
  ChevronRight,
  HelpCircle,
  LogOut,
  Shield,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useLogout } from "@/lib/session";

export const Route = createFileRoute("/hr/more")({
  head: () => ({
    meta: [
      { title: "More — Talento for employers" },
      { name: "description", content: "Company profile, team, hiring tools, settings and support." },
      { property: "og:title", content: "More — Talento for employers" },
      { property: "og:description", content: "Manage your hiring workspace." },
    ],
  }),
  component: HrMore,
});

function HrMore() {
  const logout = useLogout();
  const { t } = useI18n();

  return (
    <AppShell variant="employer" title="More">
      <Group title={t("Company")}>
        <Item to="/hr/company" icon={<Building2 className="h-4 w-4" />} label={t("Company Profile")} />
      </Group>

      <Group title={t("Saved & hiring")}>
        <Item to="/hr/saved" icon={<Bookmark className="h-4 w-4" />} label={t("Saved Candidates")} />
      </Group>

      <Group title={t("Preferences")}>
        <Item
          to="/hr/notifications"
          icon={<Bell className="h-4 w-4" />}
          label={t("Notifications")}
        />
        <Setting section="privacy" icon={<Shield className="h-4 w-4" />} label={t("Privacy")} />
      </Group>

      <Group title={t("Support")}>
        <Item to="/hr/assistant" icon={<Sparkles className="h-4 w-4" />} label={t("AI Assistant")} />
        <Setting section="help" icon={<HelpCircle className="h-4 w-4" />} label={t("Help center")} />
        <Setting section="terms" icon={<Shield className="h-4 w-4" />} label={t("Terms of service")} />
      </Group>

      <Button
        variant="ghost"
        className="mt-4 w-full justify-start gap-2 text-destructive"
        onClick={logout}
      >
        <LogOut className="h-4 w-4" /> Log out
      </Button>
    </AppShell>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="surface divide-y divide-border overflow-hidden">{children}</div>
    </section>
  );
}

function Item({
  to,
  icon,
  label,
  hint,
}: {
  to: "/hr/company" | "/hr/notifications" | "/hr/assistant" | "/hr/saved";
  icon: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/60"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function Setting({
  section,
  icon,
  label,
  hint,
}: {
  section: string;
  icon: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <Link
      to="/hr/settings/$section"
      params={{ section }}
      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/60"
    >
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
