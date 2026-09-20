import { createFileRoute } from "@tanstack/react-router";
import { BellOff } from "lucide-react";
import { AppShell, PageHeader } from "@/components/app-shell";
import { EmptyState } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Talento" },
      { name: "description", content: "Updates on your applications, matches and career path." },
      { property: "og:title", content: "Notifications — Talento" },
      { property: "og:description", content: "Stay on top of your job search." },
    ],
  }),
  component: Notifications,
});

function Notifications() {
  const { state, update } = useStore();

  return (
    <AppShell variant="seeker" title="Notifications">
      <PageHeader
        title="Notifications"
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              update((s) => ({
                ...s,
                notifications: s.notifications.map((n) => ({ ...n, read: true })),
              }))
            }
          >
            Mark all as read
          </Button>
        }
      />
      {state.notifications.length === 0 ? (
        <EmptyState
          icon={<BellOff className="h-6 w-6" />}
          title="No notifications"
          body="We'll let you know when something happens with your applications."
        />
      ) : (
        <div className="space-y-2">
          {state.notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() =>
                update((s) => ({
                  ...s,
                  notifications: s.notifications.map((x) =>
                    x.id === n.id ? { ...x, read: true } : x,
                  ),
                }))
              }
              className={`surface w-full p-4 text-left ${n.read ? "" : "border-primary/40"}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{n.title}</p>
                <span className="text-xs text-muted-foreground">{n.when}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              {!n.read && (
                <span className="mt-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  New
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </AppShell>
  );
}
