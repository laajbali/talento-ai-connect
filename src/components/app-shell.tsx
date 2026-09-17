import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Briefcase,
  Building2,
  FileText,
  Home,
  LayoutGrid,
  LogOut,
  Search,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "./brand";
import { Button } from "@/components/ui/button";
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
  { to: "/app/cv", label: "My CV", icon: <FileText className="h-5 w-5" /> },
  { to: "/app/more", label: "More", icon: <LayoutGrid className="h-5 w-5" /> },
];

const hrNav: NavItem[] = [
  { to: "/hr", label: "Home", icon: <Home className="h-5 w-5" />, exact: true },
  { to: "/hr/candidates", label: "Candidates", icon: <Users className="h-5 w-5" /> },
  { to: "/hr/jobs", label: "Jobs", icon: <Briefcase className="h-5 w-5" /> },
  { to: "/hr/more", label: "More", icon: <LayoutGrid className="h-5 w-5" /> },
];

export function AppShell({
  children,
  variant,
  title,
}: {
  children: ReactNode;
  variant: "seeker" | "employer";
  title?: string;
}) {
  const nav = variant === "seeker" ? seekerNav : hrNav;
  const { state, reset } = useStore();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = state.notifications.filter((n) => !n.read).length;

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.to : pathname.startsWith(item.to);

  const signOut = () => {
    reset();
    navigate({ to: "/" });
  };

  const displayName = variant === "seeker" ? state.seeker.fullName : state.company.name;

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto flex w-full max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-sidebar px-4 py-6 lg:flex">
          <Link to="/" className="px-2">
            <Logo />
          </Link>
          <nav className="mt-8 flex flex-1 flex-col gap-1">
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
                {item.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-border pt-4">
              {variant === "seeker" ? (
                <>
                  <SideLink to="/app/analysis" label="Career Analysis" />
                  <SideLink to="/app/gap" label="Career Gap Analysis" />
                  <SideLink to="/app/path" label="Career Path" />
                  <SideLink to="/app/applications" label="My Applications" />
                  <SideLink to="/app/saved" label="Saved Jobs" />
                </>
              ) : (
                <>
                  <SideLink to="/hr/search" label="AI Candidate Search" />
                  <SideLink to="/hr/screening" label="AI CV Screening" />
                  <SideLink to="/hr/saved" label="Saved Candidates" />
                  <SideLink to="/hr/company" label="Company Profile" />
                </>
              )}
            </div>
          </nav>
          <Button variant="ghost" className="justify-start gap-2 text-destructive" onClick={signOut}>
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur sm:flex sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Link to="/" className="lg:hidden">
                <Logo compact />
              </Link>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{title ?? "Talento"}</p>
                <p className="truncate text-xs text-muted-foreground">{displayName}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {variant === "employer" && (
                <Button asChild variant="ghost" size="icon" aria-label="AI candidate search">
                  <Link to="/hr/search">
                    <Search className="h-5 w-5" />
                  </Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="icon" aria-label="Notifications">
                <Link to={variant === "seeker" ? "/app/notifications" : "/hr/notifications"}>
                  <span className="relative">
                    <Bell className="h-5 w-5" />
                    {unread > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive" />
                    )}
                  </span>
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" aria-label="Profile">
                <Link to={variant === "seeker" ? "/app/profile" : "/hr/company"}>
                  {variant === "seeker" ? (
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                      {state.seeker.fullName
                        .split(" ")
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                </Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 px-4 pb-28 pt-4 sm:px-6 lg:pb-10">{children}</main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-4">
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
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function SideLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
      activeProps={{ className: "text-sidebar-accent-foreground font-medium" }}
    >
      {label}
    </Link>
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
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
