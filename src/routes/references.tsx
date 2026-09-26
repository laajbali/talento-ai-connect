import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";

const title = "Talento — Project & References";
const desc = "Project information and references for SAIF 2026.";

export const Route = createFileRoute("/references")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: desc },
      { property: "og:title", content: title },
      { property: "og:description", content: desc },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReferencesPage,
});

const refs = [
  { src: "World Economic Forum (2025).", t: "The Future of Jobs Report 2025.", u: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/" },
  { src: "National Institute of Standards and Technology (NIST).", t: "Four Principles of Explainable Artificial Intelligence.", u: "https://www.nist.gov/publications/four-principles-explainable-artificial-intelligence" },
  { src: "OECD (2026).", t: "AI and Skills.", u: "https://www.oecd.org/en/publications/ai-and-skills_f843b352-en/full-report.html" },
  { src: "OECD (2026).", t: "Skills in the AI Age.", u: "https://www.oecd.org/en/publications/skills-in-the-ai-age_972bd15e-en/full-report.html" },
];

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="surface p-5">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-primary">
        Section {n} — {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ReferencesPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto max-w-3xl px-4 py-4">
        <Logo />
      </header>
      <div className="brand-gradient">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      <main className="mx-auto grid max-w-3xl gap-4 px-4 py-8">
        <Section n={1} title="Project Prototype">
          <Button asChild>
            <a href="https://talento-ai-connect.lovable.app/" target="_blank" rel="noopener noreferrer">
              View Talento Prototype <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </Section>
        <Section n={2} title="Development Platform">
          <p className="font-semibold">Lovable</p>
        </Section>
        <Section n={3} title="References">
          <ol className="grid gap-4">
            {refs.map((r, i) => (
              <li key={r.u} className="flex gap-3 text-sm">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-muted-foreground">{r.src}</p>
                  <p className="font-semibold">{r.t}</p>
                  <a href={r.u} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline-offset-2 hover:underline">
                    {r.u}
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </Section>
        <Section n={4} title="Prototype Scope">
          <p className="text-sm text-muted-foreground">
            The current Talento prototype does not use external proprietary datasets or third-party recruitment APIs.
          </p>
        </Section>
      </main>
    </div>
  );
}
