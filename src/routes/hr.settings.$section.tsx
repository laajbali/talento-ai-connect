import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/hr/settings/$section")({
  head: () => ({
    meta: [
      { title: "HR settings — Talento" },
      { name: "description", content: "Language, privacy, terms, help centre and support for employers." },
      { property: "og:title", content: "HR settings — Talento" },
      { property: "og:description", content: "Manage your hiring workspace preferences." },
    ],
  }),
  component: HrSettings,
});

const FAQ = [
  {
    q: "How does Talento rank candidates?",
    a: "Each candidate is scored against the job on required skills (40%), education (18%), experience (18%), preferred skills (12%), certifications (7%) and projects (5%). Every score comes with the matching and missing items.",
  },
  {
    q: "Which CV formats can I screen?",
    a: "Text-based PDF, DOC, DOCX and TXT. Scanned images are not readable.",
  },
  {
    q: "Can I edit an AI-generated job post?",
    a: "Yes. The description, responsibilities and requirements are all editable before you publish or save a draft.",
  },
];

function HrSettings() {
  const { section } = useParams({ from: "/hr/settings/$section" });
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const [alerts, setAlerts] = useState(true);
  const [teamVisible, setTeamVisible] = useState(true);
  const [message, setMessage] = useState("");

  const title =
    section === "language"
      ? "Language"
      : section === "privacy"
        ? "Privacy"
        : section === "terms"
          ? "Terms of Service"
          : section === "help"
            ? "Help Center"
            : section === "contact"
              ? "Contact Us"
              : "Settings";

  return (
    <AppShell variant="employer" title={title}>
      <PageHeader title={title} />

      <div className="surface space-y-4 p-5">
        {section === "language" && (
          <div className="space-y-2">
            {([{ id: "en", label: "English" }, { id: "ar", label: "العربية" }] as const).map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setLang(l.id);
                  toast.success(l.id === "ar" ? "تم ضبط اللغة على العربية." : "Language set to English.");
                }}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-sm ${
                  lang === l.id ? "border-primary bg-accent" : "border-border"
                }`}
              >
                {l.label}
                {lang === l.id && <span className="text-xs font-semibold text-primary">{t("Selected")}</span>}
              </button>
            ))}
          </div>
        )}

        {section === "appearance" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {(["light", "dark"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setTheme(mode)}
                className={`flex items-center justify-between rounded-xl border p-3 text-sm ${theme === mode ? "border-primary bg-accent" : "border-border"}`}
              >
                <span className="flex items-center gap-2">
                  {mode === "light" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {t(mode === "light" ? "Light" : "Dark")}
                </span>
                {theme === mode && <span className="text-xs font-semibold text-primary">{t("Selected")}</span>}
              </button>
            ))}
          </div>
        )}

        {section === "privacy" && (
          <>
            <Toggle
              label="Email alerts for new applicants"
              description="Get an email when a candidate above 80% match applies."
              checked={alerts}
              onChange={setAlerts}
            />
            <Toggle
              label="Show hiring team on job posts"
              description="Candidates can see who is handling the role."
              checked={teamVisible}
              onChange={setTeamVisible}
            />
            <p className="text-xs text-muted-foreground">
              Candidate data is used only for recruitment and is never shared outside your team.
            </p>
          </>
        )}

        {section === "terms" && (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Employers agree to use Talento candidate data solely for recruitment and to store it
              securely.
            </p>
            <p>
              Match percentages are decision support, not a hiring decision. Final evaluation and
              fair treatment of every applicant remain the employer's responsibility.
            </p>
            <p>Job posts must be genuine, accurate and non-discriminatory.</p>
          </div>
        )}

        {section === "help" && (
          <div className="space-y-4">
            {FAQ.map((f) => (
              <div key={f.q}>
                <p className="text-sm font-semibold">{f.q}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
            <Button asChild variant="outline">
              <Link to="/hr/settings/$section" params={{ section: "contact" }}>
                Still need help? Contact us
              </Link>
            </Button>
          </div>
        )}

        {section === "contact" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="msg">How can we help?</Label>
              <Textarea
                id="msg"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or issue"
              />
            </div>
            <Input placeholder="Reply email" aria-label="Reply email" />
            <Button
              onClick={() => {
                if (message.trim().length < 10) {
                  toast.error("Please add a few more details (10 characters minimum).");
                  return;
                }
                setMessage("");
                toast.success("Message sent. Our team replies within one business day.");
              }}
            >
              Send message
            </Button>
            <p className="text-xs text-muted-foreground">Or email employers@talento.sa</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
