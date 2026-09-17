import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/app/settings/$section")({
  head: () => ({
    meta: [
      { title: "Settings — Talento" },
      { name: "description", content: "Language, privacy, terms, help centre and contact options." },
      { property: "og:title", content: "Settings — Talento" },
      { property: "og:description", content: "Manage your Talento preferences." },
    ],
  }),
  component: SettingsSection,
});

const FAQ = [
  {
    q: "How is my match percentage calculated?",
    a: "Talento weights required skills (40%), education (18%), experience (18%), preferred skills (12%), certifications (7%) and relevant projects (5%). Every job page shows the full breakdown.",
  },
  {
    q: "Can I edit the CV the AI generated?",
    a: "Yes. Open My CV and use the builder to edit any section, change template, preview and download.",
  },
  {
    q: "Who can see my profile?",
    a: "Only employers on Talento who are actively hiring for roles you match. You can turn profile visibility off in Privacy.",
  },
];

function SettingsSection() {
  const { section } = useParams({ from: "/app/settings/$section" });
  const [language, setLanguage] = useState("English");
  const [visible, setVisible] = useState(true);
  const [alerts, setAlerts] = useState(true);
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
    <AppShell variant="seeker" title={title}>
      <PageHeader title={title} />

      <div className="surface space-y-4 p-5">
        {section === "language" && (
          <>
            <p className="text-sm text-muted-foreground">
              Choose the language used across Talento.
            </p>
            <div className="space-y-2">
              {["English", "العربية"].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    setLanguage(l);
                    toast.success(`Language set to ${l}.`);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-sm ${
                    language === l ? "border-primary bg-accent" : "border-border"
                  }`}
                >
                  {l}
                  {language === l && <span className="text-xs font-semibold text-primary">Selected</span>}
                </button>
              ))}
            </div>
          </>
        )}

        {section === "privacy" && (
          <>
            <Toggle
              label="Profile visible to employers"
              description="Employers matching your skills can find and contact you."
              checked={visible}
              onChange={setVisible}
            />
            <Toggle
              label="Job alerts"
              description="Get notified when a job above 85% match is published."
              checked={alerts}
              onChange={setAlerts}
            />
            <p className="text-xs text-muted-foreground">
              Talento stores only the information you provide and never sells your data to third
              parties. You can delete your account at any time from Contact Us.
            </p>
          </>
        )}

        {section === "terms" && (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              By using Talento you agree to provide accurate information about your education,
              skills and experience.
            </p>
            <p>
              Match percentages are guidance generated from the information available; they are not
              a hiring decision and do not guarantee an interview or an offer.
            </p>
            <p>
              Employers agree to use candidate data only for recruitment purposes and to treat all
              applicants fairly and without discrimination.
            </p>
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
              <Link to="/app/settings/$section" params={{ section: "contact" }}>
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
            <Input placeholder="Reply email" defaultValue="" aria-label="Reply email" />
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
            <p className="text-xs text-muted-foreground">Or email support@talento.sa</p>
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
