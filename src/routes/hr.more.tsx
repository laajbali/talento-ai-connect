import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  Building2,
  ChevronRight,
  FileSearch,
  Globe,
  HelpCircle,
  LifeBuoy,
  LogOut,
  Moon,
  Sun,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

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
  const { state, reset } = useStore();
  const navigate = useNavigate();
  const { t, lang } = useI18n();
  const { theme } = useTheme();

  return (
    <AppShell variant="employer" title="More">
      <PageHeader title="More" subtitle={state.company.name} />

      <Group title="Hiring tools">
        <Item to="/hr/search" icon={<Search className="h-4 w-4" />} label="AI candidate search" />
        <Item to="/hr/screening" icon={<FileSearch className="h-4 w-4" />} label="AI CV screening" />
        <Item to="/hr/candidates" icon={<Users className="h-4 w-4" />} label="All candidates" />
        <Item to="/hr/saved" icon={<Bookmark className="h-4 w-4" />} label="Saved candidates" />
      </Group>

      <Group title="Company">
        <Item to="/hr/company" icon={<Building2 className="h-4 w-4" />} label="Company profile & team" />
        <Item
          to="/hr/notifications"
          icon={<Bell className="h-4 w-4" />}
          label="Notifications"
          hint={`${state.notifications.filter((n) => !n.read).length} unread`}
        />
      </Group>

      <Group title="Preferences & support">
        <Setting section="language" icon={<Globe className="h-4 w-4" />} label={t("Language")} hint={lang === "ar" ? "العربية" : "English"} />
        <Setting section="appearance" icon={theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} label={t("Appearance")} hint={t(theme === "dark" ? "Dark" : "Light")} />
        <Setting section="privacy" icon={<Shield className="h-4 w-4" />} label="Privacy" />
        <Setting section="terms" icon={<Shield className="h-4 w-4" />} label="Terms of service" />
        <Setting section="help" icon={<HelpCircle className="h-4 w-4" />} label="Help center" />
        <Setting section="contact" icon={<LifeBuoy className="h-4 w-4" />} label="Contact us" />
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
  to: "/hr/search" | "/hr/screening" | "/hr/candidates" | "/hr/saved" | "/hr/company" | "/hr/notifications";
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
