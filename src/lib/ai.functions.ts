import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

function parseJson<T>(text: string, fallback: T): T {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.search(/[[{]/);
  if (start === -1) return fallback;
  const candidate = cleaned.slice(start);
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const lastBrace = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
    try {
      return JSON.parse(candidate.slice(0, lastBrace + 1)) as T;
    } catch {
      return fallback;
    }
  }
}

async function ask(system: string, prompt: string) {
  const { getModel } = await import("./ai-gateway.server");
  const result = await generateText({
    model: getModel(),
    system,
    prompt,
    providerOptions: { lovable: { reasoningEffort: "low" } },
  });
  return result.text;
}

/* ---------------- CV generation ---------------- */

const CvInput = z.object({
  fullName: z.string().min(1),
  targetRole: z.string().min(1),
  email: z.string().min(1),
  phone: z.string().default(""),
  location: z.string().default(""),
  education: z.string().default(""),
  experience: z.string().default(""),
  skills: z.string().default(""),
  projects: z.string().default(""),
  certifications: z.string().default(""),
  languages: z.string().default(""),
});

export const generateCv = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => CvInput.parse(d))
  .handler(async ({ data }) => {
    const text = await ask(
      "You are Talento's CV writing assistant. You write concise, professional, ATS-friendly CV content for the Saudi and Gulf job market. Reply with JSON only, no commentary.",
      `Build a structured CV from these notes. Improve wording, use strong action verbs, keep every bullet one sentence.
Notes:
Name: ${data.fullName}
Target role: ${data.targetRole}
Email: ${data.email}
Phone: ${data.phone}
Location: ${data.location}
Education: ${data.education}
Work experience: ${data.experience}
Skills: ${data.skills}
Projects: ${data.projects}
Certifications: ${data.certifications}
Languages: ${data.languages}

Return JSON exactly in this shape:
{"personal":{"fullName":"","title":"","email":"","phone":"","location":"","summary":""},
"education":[{"degree":"","school":"","period":"","gpa":""}],
"skills":[""],
"experience":[{"role":"","company":"","period":"","summary":""}],
"projects":[{"name":"","description":""}],
"certifications":[""],
"languages":[""]}`,
    );
    return parseJson(text, null);
  });

/* ---------------- Career analysis ---------------- */

const AnalysisInput = z.object({
  degree: z.string(),
  major: z.string(),
  university: z.string(),
  years: z.number(),
  skills: z.array(z.string()),
  certifications: z.array(z.string()),
  projects: z.array(z.string()).default([]),
  targetRole: z.string().default("Data Analyst"),
});

export const analyzeCareer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => AnalysisInput.parse(d))
  .handler(async ({ data }) => {
    const text = await ask(
      "You are Talento's career analyst. You are specific, honest and practical. Reply with JSON only.",
      `Analyse this candidate for the target role "${data.targetRole}".
Degree: ${data.degree} in ${data.major} from ${data.university}
Years of experience: ${data.years}
Skills: ${data.skills.join(", ")}
Certifications: ${data.certifications.join(", ") || "none"}
Projects: ${data.projects.join("; ") || "none"}

Return JSON:
{"summary":"2 sentence skills summary",
"strengths":["3 to 4 specific strengths"],
"improvements":["3 to 4 concrete areas to improve, each saying why"],
"recommendedSkills":[{"skill":"","reason":"","weeks":4}],
"nextSteps":["3 concrete actions"]}`,
    );
    return parseJson(text, null);
  });

/* ---------------- HR natural-language candidate search ---------------- */

const SearchInput = z.object({ query: z.string().min(3) });

export const parseCandidateQuery = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => SearchInput.parse(d))
  .handler(async ({ data }) => {
    const text = await ask(
      "You convert recruiter requests in English or Arabic into structured search criteria. Reply with JSON only.",
      `Recruiter request: "${data.query}"

Return JSON:
{"skills":[""],"major":"","degree":"","location":"","maxYears":null,"minYears":null,"availability":"","graduationYear":null,"certifications":[""],"interpretation":"one sentence explaining how you read the request"}
Use empty strings, empty arrays or null when a field is not mentioned.`,
    );
    return parseJson(text, null);
  });

/* ---------------- AI job description ---------------- */

const JobInput = z.object({
  title: z.string().min(1),
  notes: z.string().default(""),
  location: z.string().default(""),
  type: z.string().default("Full-time"),
  education: z.string().default(""),
  skills: z.string().default(""),
  experience: z.string().default(""),
  certifications: z.string().default(""),
});

export const writeJobPost = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => JobInput.parse(d))
  .handler(async ({ data }) => {
    const text = await ask(
      "You are Talento's job posting writer. You write clear, inclusive, professional job posts. Reply with JSON only.",
      `Write a professional job post.
Title: ${data.title}
Notes: ${data.notes}
Location: ${data.location}
Type: ${data.type}
Required education: ${data.education}
Required skills: ${data.skills}
Experience: ${data.experience}
Certifications: ${data.certifications}

Return JSON:
{"description":"2 short paragraphs","responsibilities":["4 bullets"],"requirements":["4 bullets"],"skills":[""],"preferredSkills":[""]}`,
    );
    return parseJson(text, null);
  });

/* ---------------- AI match insight ---------------- */

const InsightInput = z.object({
  candidate: z.string(),
  job: z.string(),
  score: z.number(),
  matching: z.array(z.string()),
  missing: z.array(z.string()),
});

export const matchInsight = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InsightInput.parse(d))
  .handler(async ({ data }) => {
    const text = await ask(
      "You are Talento's hiring assistant. Be concise and evidence based. Reply with JSON only.",
      `Explain this match for a recruiter.
Candidate: ${data.candidate}
Job: ${data.job}
Computed match: ${data.score}%
Matching skills: ${data.matching.join(", ") || "none"}
Missing skills: ${data.missing.join(", ") || "none"}

Return JSON: {"verdict":"one sentence","strong":["2 to 3 points"],"risks":["1 to 3 points"],"recommendation":"one sentence next step"}`,
    );
    return parseJson(text, null);
  });

/* ---------------- CV screening extraction ---------------- */

const ScreenInput = z.object({ text: z.string().min(20), fileName: z.string().default("CV") });

export const screenCv = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ScreenInput.parse(d))
  .handler(async ({ data }) => {
    const text = await ask(
      "You extract structured candidate data from CV text. Reply with JSON only.",
      `CV file: ${data.fileName}
CV text:
${data.text.slice(0, 6000)}

Return JSON:
{"name":"","title":"","degree":"","major":"","university":"","gpa":"","graduationYear":null,"location":"","years":0,"skills":[""],"certifications":[""],"languages":[""],"projects":[{"name":"","description":""}],"summary":""}`,
    );
    return parseJson(text, null);
  });

/* ---------------- Role-aware product assistant ---------------- */

const AssistantInput = z.object({
  role: z.enum(["seeker", "employer"]),
  question: z.string().min(2).max(1000),
  context: z.string().max(2000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).max(6),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => AssistantInput.parse(data))
  .handler(async ({ data }) => {
    const roleGuide = data.role === "seeker"
      ? "Guide job seekers through CV editing, match explanations, job discovery, career analysis, gap analysis, career paths, applications, saved jobs, profile, notifications and settings."
      : "Guide employers through candidates, AI candidate search, AI CV screening, candidate match explanations, job publishing, applicants, company/team management, notifications and settings.";
    const history = data.history.map((message) => `${message.role}: ${message.content}`).join("\n");
    return ask(
      `You are Talento's in-product AI Assistant. ${roleGuide} Answer in the same language as the user's question. Be concise, accurate, and action-oriented. Only describe features that exist in Talento. Never invent account data or claim an action was completed.`,
      `Current role: ${data.role}\nCurrent product context: ${data.context}\nRecent conversation:\n${history}\n\nUser question: ${data.question}\n\nGive a direct answer in no more than 140 words.`,
    );
  });
