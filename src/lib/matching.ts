import type { Candidate, Job, SeekerProfile } from "./types";

export interface DimensionResult {
  label: string;
  weight: number;
  score: number;
  verdict: "Match" | "Partial" | "Missing";
  detail: string;
}

export interface MatchResult {
  score: number;
  matching: string[];
  missing: string[];
  improve: string[];
  dimensions: DimensionResult[];
  why: string[];
  gaps: string[];
  nextSteps: string[];
}

const norm = (s: string) => s.trim().toLowerCase();

const EDU_RANK: Record<string, number> = {
  "high school": 1,
  diploma: 2,
  "bachelor's degree": 3,
  "master's degree": 4,
  phd: 5,
};

function eduRank(v: string) {
  return EDU_RANK[norm(v)] ?? 3;
}

interface Profile {
  skills: string[];
  education: string;
  years: number;
  certifications: string[];
  projects: number;
}

export function toProfile(p: SeekerProfile, projects = 1): Profile {
  return {
    skills: p.skills,
    education: p.degree,
    years: p.years,
    certifications: p.certifications,
    projects,
  };
}

export function candidateToProfile(c: Candidate): Profile {
  return {
    skills: c.skills,
    education: c.degree,
    years: c.years,
    certifications: c.certifications,
    projects: c.projects.length,
  };
}

/** Multi-dimensional match: required skills, preferred skills, education, experience, certifications, projects. */
export function computeMatch(profile: Profile, job: Job): MatchResult {
  const owned = new Set(profile.skills.map(norm));

  const matching = job.skills.filter((s) => owned.has(norm(s)));
  const missing = job.skills.filter((s) => !owned.has(norm(s)));
  const improve = job.preferredSkills.filter((s) => !owned.has(norm(s)));

  const requiredScore = job.skills.length ? matching.length / job.skills.length : 1;
  const preferredMatched = job.preferredSkills.filter((s) => owned.has(norm(s)));
  const preferredScore = job.preferredSkills.length
    ? preferredMatched.length / job.preferredSkills.length
    : 1;

  const eduScore = Math.min(1, eduRank(profile.education) / eduRank(job.education));
  const expScore = job.minYears === 0 ? 1 : Math.min(1, profile.years / job.minYears);
  const certScore = job.certifications.length
    ? job.certifications.filter((c) =>
        profile.certifications.some((pc) => norm(pc).includes(norm(c)) || norm(c).includes(norm(pc))),
      ).length / job.certifications.length
    : 1;
  const projectScore = Math.min(1, profile.projects / 2);

  const dimensions: DimensionResult[] = [
    {
      label: "Required skills",
      weight: 0.4,
      score: requiredScore,
      verdict: requiredScore === 1 ? "Match" : requiredScore >= 0.5 ? "Partial" : "Missing",
      detail: `${matching.length} of ${job.skills.length} required skills present${
        missing.length ? ` — missing ${missing.join(", ")}` : ""
      }.`,
    },
    {
      label: "Preferred skills",
      weight: 0.12,
      score: preferredScore,
      verdict: preferredScore === 1 ? "Match" : preferredScore > 0 ? "Partial" : "Missing",
      detail: job.preferredSkills.length
        ? `${preferredMatched.length} of ${job.preferredSkills.length} nice-to-have skills present.`
        : "No preferred skills listed for this role.",
    },
    {
      label: "Education",
      weight: 0.18,
      score: eduScore,
      verdict: eduScore >= 1 ? "Match" : eduScore >= 0.75 ? "Partial" : "Missing",
      detail: `Role asks for ${job.education}; profile holds ${profile.education}.`,
    },
    {
      label: "Experience",
      weight: 0.18,
      score: expScore,
      verdict: expScore >= 1 ? "Match" : expScore >= 0.5 ? "Partial" : "Missing",
      detail: job.minYears
        ? `Role asks for ${job.minYears}+ years; profile has ${profile.years}.`
        : "Open to fresh graduates — experience requirement met.",
    },
    {
      label: "Certifications",
      weight: 0.07,
      score: certScore,
      verdict: certScore >= 1 ? "Match" : certScore > 0 ? "Partial" : "Missing",
      detail: job.certifications.length
        ? `Requested: ${job.certifications.join(", ")}.`
        : "No certifications required.",
    },
    {
      label: "Relevant projects",
      weight: 0.05,
      score: projectScore,
      verdict: projectScore >= 1 ? "Match" : projectScore > 0 ? "Partial" : "Missing",
      detail: `${profile.projects} relevant project${profile.projects === 1 ? "" : "s"} on the profile.`,
    },
  ];

  const score = Math.round(
    dimensions.reduce((sum, d) => sum + d.score * d.weight, 0) * 100,
  );

  const why = dimensions
    .filter((d) => d.verdict === "Match")
    .map((d) => `${d.label}: ${d.detail}`);
  const gaps = dimensions
    .filter((d) => d.verdict !== "Match")
    .map((d) => `${d.label}: ${d.detail}`);

  const nextSteps: string[] = [];
  if (missing.length) nextSteps.push(`Learn ${missing[0]} — it is a required skill for this role.`);
  if (improve.length) nextSteps.push(`Strengthen ${improve[0]} to stand out against other applicants.`);
  if (expScore < 1) nextSteps.push("Add a hands-on project to compensate for the experience gap.");
  if (!nextSteps.length) nextSteps.push("You meet the bar — apply now and prepare for the interview.");

  return { score, matching, missing, improve, dimensions, why, gaps, nextSteps };
}

export function rankJobs(profile: Profile, jobs: Job[]) {
  return jobs
    .map((job) => ({ job, match: computeMatch(profile, job) }))
    .sort((a, b) => b.match.score - a.match.score);
}

export function rankCandidates(job: Job, candidates: Candidate[]) {
  return candidates
    .map((candidate) => ({ candidate, match: computeMatch(candidateToProfile(candidate), job) }))
    .sort((a, b) => b.match.score - a.match.score);
}

export function careerReadiness(profile: SeekerProfile, cvComplete: number) {
  const skillScore = Math.min(1, profile.skills.length / 10);
  const certScore = Math.min(1, profile.certifications.length / 2);
  const expScore = Math.min(1, profile.years / 2);
  const eduScore = eduRank(profile.degree) >= 3 ? 1 : 0.6;
  const cvScore = cvComplete / 100;
  const score = Math.round(
    (skillScore * 0.3 + certScore * 0.15 + expScore * 0.2 + eduScore * 0.15 + cvScore * 0.2) * 100,
  );
  return {
    score,
    breakdown: [
      { label: "Skills depth", value: Math.round(skillScore * 100) },
      { label: "Certifications", value: Math.round(certScore * 100) },
      { label: "Experience", value: Math.round(expScore * 100) },
      { label: "Education", value: Math.round(eduScore * 100) },
      { label: "CV completeness", value: Math.round(cvScore * 100) },
    ],
  };
}
