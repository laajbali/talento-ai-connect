import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { NotificationList } from "@/components/notification-list";

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
  return (
    <AppShell variant="seeker" title="Notifications">
      <PageHeader title="Notifications" />
      <NotificationList emptyBody={"We'll let you know when something happens with your applications."} />
    </AppShell>
  );
}
