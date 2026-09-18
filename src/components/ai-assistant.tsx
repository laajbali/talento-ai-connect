import { Bot, Send, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { AiBadge } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askAssistant } from "@/lib/ai.functions";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const suggestions: Record<Role, string[]> = {
  seeker: [
    "How do I edit my CV?",
    "What does my Match % mean?",
    "How do I use Career Gap Analysis?",
    "How do I find a suitable job?",
    "What does my Career Path mean?",
  ],
  employer: [
    "How do I search for candidates?",
    "How do I use AI CV Screening?",
    "What does Candidate Match % mean?",
    "How do I publish a job?",
    "How do I manage applicants?",
  ],
};

export function AiAssistant({ role }: { role: Role }) {
  const { state } = useStore();
  const { t } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const variant = role === "seeker" ? "seeker" : "employer";

  const send = async (question: string) => {
    const clean = question.trim();
    if (!clean || loading) return;
    const userMessage: Message = { id: `user-${Date.now()}`, role: "user", content: clean };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const answer = await askAssistant({
        data: {
          role,
          question: clean,
          history: nextMessages.slice(-6).map(({ role: messageRole, content }) => ({ role: messageRole, content })),
          context:
            role === "seeker"
              ? `Target role: ${state.targetRole}. CV template: ${state.cvTemplate}. Saved jobs: ${state.savedJobs.length}. Applications: ${state.applications.length}.`
              : `Company: ${state.company.name}. Jobs: ${state.jobs.length}. Saved candidates: ${state.savedCandidates.length}.`,
        },
      });
      if (!answer?.trim()) throw new Error("The assistant returned an empty response.");
      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: "assistant", content: answer },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI Assistant is unavailable right now.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell variant={variant} title="AI Assistant">
      <PageHeader
        title="AI Assistant"
        subtitle={role === "seeker" ? "Get help using your Talento career tools." : "Get help using your Talento hiring tools."}
      />

      <section className="surface overflow-hidden">
        <div className="border-b border-border bg-accent/50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <AiBadge /> {t("Talento guidance for your role")}
          </p>
        </div>

        <div className="min-h-72 space-y-4 p-4 sm:p-5" aria-live="polite">
          {messages.length === 0 && (
            <div className="flex flex-col items-center py-7 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground">
                <Sparkles className="h-5 w-5" />
              </span>
              <p className="mt-3 font-semibold">{t("How can I help?")}</p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {t("Ask about Talento features, match scores, or your next step.")}
              </p>
              <div className="mt-4 flex max-w-2xl flex-wrap justify-center gap-2">
                {suggestions[role].map((suggestion) => (
                  <Button key={suggestion} type="button" variant="outline" size="sm" onClick={() => void send(suggestion)}>
                    {t(suggestion)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Bot className="h-4 w-4" />
                </span>
              )}
              <div className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                {message.content}
              </div>
              {message.role === "user" && (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </span>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground">
                <Bot className="h-4 w-4" />
              </span>
              {t("Thinking…")}
            </div>
          )}
        </div>

        <form
          className="border-t border-border p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void send(input);
          }}
        >
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t("Ask the Talento AI Assistant")}
              rows={2}
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label={t("Send message")}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </section>
    </AppShell>
  );
}
