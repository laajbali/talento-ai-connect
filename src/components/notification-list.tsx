import type { ReactNode } from "react";
import { Bell, BellOff, Briefcase, CalendarCheck, CheckCheck, FileCheck, MessageSquare, Star } from "lucide-react";
import { EmptyState } from "@/components/brand";
import { useStore } from "@/lib/store";

type Notice = { id: string; title: string; body: string; when: string; read: boolean };

function iconFor(n: Notice): ReactNode {
  const t = `${n.title} ${n.body}`.toLowerCase();
  const cls = "h-4 w-4";
  if (t.includes("shortlist")) return <Star className={cls} />;
  if (t.includes("interview")) return <CalendarCheck className={cls} />;
  if (t.includes("message") || t.includes("chat")) return <MessageSquare className={cls} />;
  if (t.includes("match") || t.includes("job")) return <Briefcase className={cls} />;
  if (t.includes("application") || t.includes("applied") || t.includes("applicant") || t.includes("cv"))
    return <FileCheck className={cls} />;
  return <Bell className={cls} />;
}

export function NotificationList({ emptyBody }: { emptyBody: string }) {
  const { state, update } = useStore();
  const items = state.notifications;
  const unread = items.filter((n) => !n.read).length;

  const markAll = () =>
    update((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  const markOne = (id: string) =>
    update((s) => ({
      ...s,
      notifications: s.notifications.map((x) => (x.id === id ? { ...x, read: true } : x)),
    }));

  if (items.length === 0) {
    return <EmptyState icon={<BellOff className="h-6 w-6" />} title="No notifications" body={emptyBody} />;
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">{unread > 0 ? `${unread} unread` : "All caught up"}</p>
        <button
          type="button"
          onClick={markAll}
          disabled={unread === 0}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:cursor-default disabled:text-muted-foreground disabled:hover:bg-transparent"
        >
          <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
        </button>
      </div>
      <ul className="space-y-2">
        {items.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => markOne(n.id)}
              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors ${
                n.read
                  ? "border-border bg-card hover:bg-muted/40"
                  : "border-primary/25 bg-primary/5 hover:bg-primary/10"
              }`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                  n.read ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground"
                }`}
              >
                {iconFor(n)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className={`text-sm leading-snug ${n.read ? "font-medium text-foreground/80" : "font-semibold"}`}>
                    {n.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 pt-0.5">
                    <span className="text-[11px] text-muted-foreground">{n.when}</span>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{n.body}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
