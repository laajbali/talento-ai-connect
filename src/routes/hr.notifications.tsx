import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader } from "@/components/app-shell";
import { NotificationList } from "@/components/notification-list";

export const Route = createFileRoute("/hr/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Talento" },
      { name: "description", content: "New applicants, shortlist changes and hiring reminders." },
      { property: "og:title", content: "Notifications — Talento" },
      { property: "og:description", content: "Stay on top of your hiring pipeline." },
    ],
  }),
  component: HrNotifications,
});

function HrNotifications() {
  return (
    <AppShell variant="employer" title="Notifications">
      <PageHeader title="Notifications" />
      <NotificationList emptyBody={"You'll be notified when candidates apply or move stage."} />
    </AppShell>
  );
}
