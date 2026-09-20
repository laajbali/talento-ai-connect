import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  BookMarked,
  ChevronRight,
  HelpCircle,
  LogOut,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useLogout } from "@/lib/session";

export const Route = createFileRoute("/app/more")({
  head: () => ({
    meta: [
      { title: "More — Talento" },
      { name: "description", content: "Profile, career tools, settings and support." },
      { property: "og:title", content: "More — Talento" },
      { property: "og:description", content: "Everything else in your Talento account." },
    ],
  }),
  component: More,
});

function More() {
  const { t } = useI18n();
  const logout = useLogout();

  return (
    <AppShell variant="seeker" title="More">
      <Group title={t("Account")}>
        <Item to="/app/profile" icon={<User className="h-4 w-4" />} label={t("Personal information")} />
        <Item to="/app/saved" icon={<BookMarked className="h-4 w-4" />} label={t("Saved jobs")} />
      </Group>

      <Group title={t("Preferences")}>
        <Item
          to="/app/notifications"
          icon={<Bell className="h-4 w-4" />}
          label={t("Notifications")}
        />
        <ItemSetting section="privacy" icon={<Shield className="h-4 w-4" />} label={t("Privacy")} />
      </Group>

      <Group title={t("Support")}>
        <Item to="/app/assistant" icon={<Sparkles className="h-4 w-4" />} label={t("AI Assistant")} />
        <ItemSetting section="help" icon={<HelpCircle className="h-4 w-4" />} label={t("Help center")} />
        <ItemSetting section="terms" icon={<Shield className="h-4 w-4" />} label={t("Terms of service")} />
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
  to: "/app/profile" | "/app/cv" | "/app/saved" | "/app/analysis" | "/app/gap" | "/app/path" | "/app/notifications" | "/app/assistant";
  icon: React.ReactNode;
  label: string;
  hint?: string;
}) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/60">
      <span className="text-muted-foreground">{icon}</span>
      <span className="flex-1">{label}</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function ItemSetting({
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
      to="/app/settings/$section"
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
