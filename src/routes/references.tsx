import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, ExternalLink } from "lucide-react";
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

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border py-7 first:border-t-0 first:pt-0">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">{label}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function ReferencesPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-3xl justify-center px-4 py-5">
        <Logo />
      </header>
      <div className="brand-gradient">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="surface p-6 sm:p-8">
          <Block label="Project Prototype">
            <Button asChild className="h-11 rounded-xl px-5 font-semibold">
              <a href="https://talento-ai-connect.lovable.app/" target="_blank" rel="noopener noreferrer">
                View Talento Prototype <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </Block>
          <Block label="Development Platform">
            <p className="text-base font-semibold">Lovable</p>
          </Block>
          <Block label="References">
            <ol className="grid gap-5">
              {refs.map((r, i) => (
                <li key={r.u} className="flex gap-3">
                  <span className="w-5 shrink-0 pt-0.5 text-sm font-bold text-primary">{i + 1}.</span>
                  <div className="min-w-0 text-sm leading-relaxed">
                    <p className="text-muted-foreground">{r.src}</p>
                    <a href={r.u} target="_blank" rel="noopener noreferrer" className="group inline-flex items-start gap-1 font-semibold text-foreground hover:text-primary">
                      <span className="underline decoration-primary/40 underline-offset-4 group-hover:decoration-primary">{r.t}</span>
                      <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    </a>
                    <a href={r.u} target="_blank" rel="noopener noreferrer" className="mt-0.5 block break-all text-xs text-primary hover:underline">
                      {r.u}
                    </a>
                  </div>
                </li>
              ))}
            </ol>
          </Block>
          <Block label="Prototype Scope">
            <p className="text-sm leading-relaxed text-muted-foreground">
              The current Talento prototype does not use external proprietary datasets or third-party recruitment APIs.
            </p>
          </Block>
        </div>
      </main>
    </div>
  );
}
