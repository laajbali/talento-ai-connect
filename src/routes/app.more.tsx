import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BookMarked,
  Briefcase,
  ChevronRight,
  FileText,
  Globe,
  HelpCircle,
  LifeBuoy,
  LogOut,
  Moon,
  Route as RouteIcon,
  Shield,
  Sparkles,
  Sun,
  User,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useTheme } from "@/lib/theme";

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
  const { state, reset } = useStore();
  const { t, lang } = useI18n();
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <AppShell variant="seeker" title="More">
      <PageHeader title="More" subtitle={state.seeker.email} />

      <Group title={t("Account")}>
        <Item to="/app/profile" icon={<User className="h-4 w-4" />} label={t("Personal information")} />
        <Item to="/app/cv" icon={<FileText className="h-4 w-4" />} label={t("My CV")} />
        <Item
          to="/app/applications"
          icon={<Briefcase className="h-4 w-4" />}
          label={t("My applications")}
        />
        <Item to="/app/saved" icon={<BookMarked className="h-4 w-4" />} label={t("Saved jobs")} />
      </Group>

      <Group title={t("Career tools")}>
        <Item to="/app/analysis" icon={<Sparkles className="h-4 w-4" />} label={t("Career analysis")} />
        <Item to="/app/gap" icon={<Sparkles className="h-4 w-4" />} label={t("Career gap analysis")} />
        <Item to="/app/path" icon={<RouteIcon className="h-4 w-4" />} label={t("Career path")} />
      </Group>

      <Group title={t("Preferences")}>
        <Item
          to="/app/notifications"
          icon={<Bell className="h-4 w-4" />}
          label={t("Notifications")}
          hint={`${state.notifications.filter((n) => !n.read).length} ${t("unread")}`}
        />
        <ItemSetting
          section="language"
          icon={<Globe className="h-4 w-4" />}
          label={t("Language")}
          hint={lang === "ar" ? "العربية" : "English"}
        />
        <ItemSetting
          section="appearance"
          icon={theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          label={t("Appearance")}
          hint={t(theme === "dark" ? "Dark" : "Light")}
        />
        <ItemSetting section="privacy" icon={<Shield className="h-4 w-4" />} label={t("Privacy")} />
      </Group>

      <Group title={t("Support")}>
        <ItemSetting section="help" icon={<HelpCircle className="h-4 w-4" />} label={t("Help center")} />
        <ItemSetting section="contact" icon={<LifeBuoy className="h-4 w-4" />} label={t("Contact us")} />
        <ItemSetting section="terms" icon={<Shield className="h-4 w-4" />} label={t("Terms of service")} />
      </Group>

      <Button
        variant="ghost"
        className="mt-4 w-full justify-start gap-2 text-destructive"
        onClick={() => {
          reset();
          navigate({ to: "/" });
        }}
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
  to: "/app/profile" | "/app/cv" | "/app/applications" | "/app/saved" | "/app/analysis" | "/app/gap" | "/app/path" | "/app/notifications";
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
