import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Briefcase,
  FileText,
  Home,
  LayoutGrid,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./brand";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { initialsFromName } from "@/lib/session";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
}

const seekerNav: NavItem[] = [
  { to: "/app", label: "Home", icon: <Home className="h-5 w-5" />, exact: true },
  { to: "/app/jobs", label: "Jobs", icon: <Briefcase className="h-5 w-5" /> },
  { to: "/app/applications", label: "Application", icon: <Briefcase className="h-5 w-5" /> },
  { to: "/app/cv", label: "CV", icon: <FileText className="h-5 w-5" /> },
  { to: "/app/more", label: "More", icon: <LayoutGrid className="h-5 w-5" /> },
];

const hrNav: NavItem[] = [
  { to: "/hr", label: "Home", icon: <Home className="h-5 w-5" />, exact: true },
  { to: "/hr/candidates", label: "Candidates", icon: <Users className="h-5 w-5" /> },
  { to: "/hr/jobs", label: "Jobs", icon: <Briefcase className="h-5 w-5" /> },
  { to: "/hr/more", label: "More", icon: <LayoutGrid className="h-5 w-5" /> },
];

export function BackButton({ className }: { className?: string }) {
  const router = useRouter();
  const navigate = useNavigate();
  const { t, dir } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.history.back();
    } else {
      const fallback = pathname.startsWith("/hr/candidates") || pathname === "/hr/search" || pathname === "/hr/screening"
        ? "/hr/candidates"
        : pathname.startsWith("/hr/jobs")
          ? "/hr/jobs"
          : pathname.startsWith("/hr")
            ? "/hr/more"
            : pathname.startsWith("/app/jobs")
              ? "/app/jobs"
              : pathname.startsWith("/app")
                ? "/app/more"
                : "/";
      navigate({ to: fallback });
    }
  };

  const Icon = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={goBack}
      aria-label={t("Back")}
      className={cn("gap-1 px-2", className)}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

function GlobalHeader({ variant, initials, unread }: {
  variant: "seeker" | "employer";
  initials: string;
  unread: number;
}) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <Logo className="shrink-0" />
      <div className="flex shrink-0 items-center gap-1">
        <Button asChild variant="ghost" size="icon" aria-label={t("Notifications")}>
          <Link to={variant === "seeker" ? "/app/notifications" : "/hr/notifications"}>
            <span className="relative">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive" />
              )}
            </span>
          </Link>
        </Button>
        <Button asChild variant="ghost" size="icon" aria-label={t("Profile")}>
          <Link to={variant === "seeker" ? "/app/profile" : "/hr/company"}>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground" data-no-translate>
              {initials}
            </span>
          </Link>
        </Button>
      </div>
    </header>
  );
}

export function AppShell({
  children,
  variant,
  title: _title,
}: {
  children: ReactNode;
  variant: "seeker" | "employer";
  title?: string;
}) {
  const nav = variant === "seeker" ? seekerNav : hrNav;
  const { state } = useStore();
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = state.notifications.filter((n) => !n.read).length;

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.to : pathname.startsWith(item.to);

  const isPrimary = nav.some((item) => item.to === pathname);
  const displayName = state.session?.name || (variant === "seeker" ? state.seeker.fullName : state.company.team[0]?.name) || state.company.name;
  const initials = initialsFromName(displayName);

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex w-full max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-e border-border bg-sidebar px-4 py-6 lg:flex">
          <nav className="mt-14 flex flex-1 flex-col gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive(item)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                {item.icon}
                {t(item.label)}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <GlobalHeader variant={variant} initials={initials} unread={unread} />

          <main className="min-w-0 flex-1 overflow-x-clip px-4 pb-28 pt-4 sm:px-6 lg:pb-10">
            {!isPrimary && <BackButton className="mb-3" />}
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <ul className={cn("mx-auto grid max-w-md", variant === "seeker" ? "grid-cols-5" : "grid-cols-4")}>
          {nav.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  isActive(item) ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.icon}
                {t(item.label)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="mb-4 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold sm:text-2xl">{t(title)}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{t(subtitle)}</p>}
      </div>
      {action}
    </div>
  );
}
