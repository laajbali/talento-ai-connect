import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Building2, Route as RouteIcon, Sparkles, Users } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth/role">Get Started</Link>
          </Button>
        </div>
      </header>

      <section className="brand-gradient">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2 lg:items-center lg:py-20">
          <div>
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
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth/role">
                  Get Started <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">I already have an account</Link>
              </Button>
            </div>
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

          <div className="surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Data Analyst — stc</p>
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-bold text-success">
                91% match
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ["SQL", "Match"],
                ["Excel", "Match"],
                ["Power BI", "Missing"],
                ["Data Visualization", "Needs improvement"],
                ["Experience", "Match"],
              ].map(([skill, verdict]) => (
                <li
                  key={skill}
                  className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2"
                >
                  <span>{skill}</span>
                  <span
                    className={
                      verdict === "Match"
                        ? "text-xs font-semibold text-success"
                        : verdict === "Missing"
                          ? "text-xs font-semibold text-destructive"
                          : "text-xs font-semibold text-warning"
                    }
                  >
                    {verdict}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg bg-accent px-3 py-2 text-xs text-accent-foreground">
              Learn Power BI in 4 weeks to move this match to 98%.
            </p>
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
            <Button asChild className="mt-4" variant="outline">
              <Link to="/auth/role">Start as a job seeker</Link>
            </Button>
          </div>
          <div className="surface p-6">
            <Building2 className="h-6 w-6 text-primary" />
            <h3 className="mt-3 text-lg font-bold">For employers & HR</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Post jobs with AI, screen CVs automatically and rank candidates with explained match
              scores.
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/auth/role">Start as an employer</Link>
            </Button>
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
