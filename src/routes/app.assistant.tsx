import { createFileRoute } from "@tanstack/react-router";
import { AiAssistant } from "@/components/ai-assistant";

export const Route = createFileRoute("/app/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — Talento" },
      { name: "description", content: "Role-aware guidance for Talento job seekers." },
      { property: "og:title", content: "AI Assistant — Talento" },
      { property: "og:description", content: "Get help with CVs, matches, jobs and career tools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <AiAssistant role="seeker" />,
});
