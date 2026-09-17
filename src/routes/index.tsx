import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Building2, Globe, Moon, Route as RouteIcon, Sparkles, Sun, Users } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Talento — Right Talent. Brighter Futures." },
      {
        name: "description",
        content:
          "Talento is an AI recruitment and career platform: job seekers see where they stand and what to learn next, employers find and evaluate the right talent faster.",
      },
      { property: "og:title", content: "Talento — Right Talent. Brighter Futures." },
      {
        property: "og:description",
        content:
          "AI career analysis, CV building and candidate matching in one platform for job seekers and hiring teams.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Know where you stand",
    body: "AI career analysis scores your readiness and explains every point of the score.",
  },
  {
    icon: <RouteIcon className="h-5 w-5" />,
    title: "See what is missing",
    body: "Gap analysis compares your profile with any target job, skill by skill.",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: "Build a real CV",
    body: "Create a professional CV with AI, upload an existing one, or write it yourself.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: "Hire with evidence",
    body: "Employers search candidates in plain language and see why each one matches.",
  },
];

function Landing() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" onClick={() => setLang(lang === "ar" ? "en" : "ar")} aria-label={t("Language")}>
            <Globe className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label={theme === "dark" ? t("Light mode") : t("Dark mode")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">{t("Log in")}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth/role">{t("Get Started")}</Link>
          </Button>
        </div>
      </header>

      <section className="brand-gradient">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-xs font-semibold text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5" /> AI recruitment & career platform
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              Right Talent.
              <br />
              <span className="text-primary">Brighter Futures.</span>
            </h1>
            <p className="mt-4 max-w-lg text-base text-muted-foreground">
              Talento helps people understand where they stand, what they are missing, and how to get
              there — while helping companies find and evaluate the right talent faster.
            </p>
            <dl className="mt-10 grid max-w-md grid-cols-4 gap-3 text-center">
              {[
                ["10K+", "Talents"],
                ["500+", "Companies"],
                ["3x", "Faster hiring"],
                ["95%", "Match accuracy"],
              ].map(([v, l]) => (
                <div key={l} className="rounded-xl bg-background/70 px-2 py-3">
                  <dt className="text-lg font-bold text-primary">{v}</dt>
                  <dd className="text-[11px] text-muted-foreground">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold">One platform, two journeys</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="surface p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                {f.icon}
              </span>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="surface p-6">
            <Users className="h-6 w-6 text-primary" />
            <h3 className="mt-3 text-lg font-bold">For job seekers</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Build your CV, measure your readiness, find matching jobs and follow a step-by-step
              career path.
            </p>
          </div>
          <div className="surface p-6">
            <Building2 className="h-6 w-6 text-primary" />
            <h3 className="mt-3 text-lg font-bold">For employers & HR</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Post jobs with AI, screen CVs automatically and rank candidates with explained match
              scores.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground">
          <Logo />
          <p>© {new Date().getFullYear()} Talento. Right Talent. Brighter Futures.</p>
        </div>
      </footer>
    </div>
  );
}
