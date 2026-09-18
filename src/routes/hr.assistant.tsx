import { createFileRoute } from "@tanstack/react-router";
import { AiAssistant } from "@/components/ai-assistant";

export const Route = createFileRoute("/hr/assistant")({
  head: () => ({
    meta: [
      { title: "HR AI Assistant — Talento" },
      { name: "description", content: "Role-aware guidance for Talento hiring teams." },
      { property: "og:title", content: "HR AI Assistant — Talento" },
      { property: "og:description", content: "Get help with candidates, screening, jobs and applicants." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AiAssistant role="employer" />,
});
