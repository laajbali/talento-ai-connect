import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
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
  try {
    const result = streamText({
      model: getModel(),
      system,
      prompt,
      maxRetries: 0,
      providerOptions: { lovable: { reasoningEffort: "low" } },
    });
    return await result.text;
  } catch (e: any) {
    const status = e?.statusCode ?? e?.lastError?.statusCode ?? e?.cause?.statusCode;
    if (status === 402) throw new Error("AI credits have run out. Please add credits to your workspace, then try again.");
    if (status === 429) throw new Error("The AI is busy right now. Please wait a moment and try again.");
    throw e;
  }
}

/* ---------------- CV generation ---------------- */

const str = z.string().nullish().transform((v) => (v ?? "").trim());
const CvInput = z.object({
  fullName: str,
  targetRole: str,
  email: str,
  phone: str,
  location: str,
  education: str,
  experience: str,
  skills: str,
  projects: str,
  certifications: str,
  languages: str,
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
    const cv = parseJson<Record<string, any> | null>(text, null);
    if (!cv || typeof cv !== "object") return null;
    const p = cv.personal ?? {};
    cv.personal = {
      fullName: p.fullName || data.fullName,
      title: p.title || data.targetRole,
      email: p.email || data.email,
      phone: p.phone || data.phone,
      location: p.location || data.location,
      summary: p.summary || "",
    };
    for (const k of ["education", "skills", "experience", "projects", "certifications", "languages"]) {
      if (!Array.isArray(cv[k])) cv[k] = [];
    }
    return cv;
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

const ScreenInput = z.object({
  text: z.string().min(40),
  fileName: z.string().default("CV"),
  targetRole: z.string().default(""),
});

const str = z.string().catch("").default("");
const strList = z
  .array(z.union([z.string(), z.number()]).transform((v) => String(v)))
  .catch([])
  .default([])
  .transform((list) => list.map((s) => s.trim()).filter(Boolean).slice(0, 14));

const ScreenResult = z.object({
  candidateName: str,
  name: str,
  title: str,
  role: str,
  matchPercentage: z.coerce.number().catch(0).default(0).transform((n) => Math.max(0, Math.min(100, Math.round(n)))),
  degree: str,
  major: str,
  university: str,
  gpa: str,
  graduationYear: z.coerce.number().nullable().catch(null).default(null),
  location: str,
  years: z.coerce.number().catch(0).default(0),
  skills: strList,
  certifications: strList,
  languages: strList,
  strengths: strList,
  skillGaps: strList,
  concerns: strList,
  relevantExperience: strList,
  education: str,
  experience: str,
  projects: z
    .array(z.object({ name: str, description: str }))
    .catch([])
    .default([]),
  explanation: str,
  recommendation: str,
  summary: str,
});

export type ScreenedCv = z.infer<typeof ScreenResult>;

export const screenCv = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ScreenInput.parse(d))
  .handler(async ({ data }): Promise<ScreenedCv> => {
    const raw = await ask(
      "You are Talento's AI CV screener. You read real CV text and report only what the CV actually contains. Never invent names, employers, schools or skills. Reply with JSON only, no commentary.",
      `Screen this CV${data.targetRole ? ` against the target role "${data.targetRole}"` : ""}.
If the target role is not given, infer the single best-fit role from the CV itself.
Base every field strictly on the CV text below. If something is not in the CV, use an empty string, empty array, 0 or null.
matchPercentage is the exception: always judge it yourself as an honest 0-100 fit score of this candidate against the target or inferred role, based on their skills, seniority and experience.

CV file: ${data.fileName}
CV text:
"""
${data.text.slice(0, 12000)}
"""

Return JSON exactly in this shape:
{"candidateName":"","title":"","role":"best fit or target role","matchPercentage":0,  // ALWAYS a real 0-100 fit score for that role, never left at 0 unless the candidate is genuinely unsuitable
"degree":"","major":"","university":"","gpa":"","graduationYear":null,"education":"one line education summary",
"location":"","years":0,
"skills":["key skills detected in the CV"],
"certifications":[""],"languages":[""],
"strengths":["3 to 4 specific strengths grounded in the CV"],
"skillGaps":["2 to 4 missing skills for the role"],
"relevantExperience":["2 to 4 lines: role at company, what they did"],
"concerns":["0 to 3 potential concerns such as gaps or short tenures"],
"projects":[{"name":"","description":""}],
"explanation":"2 sentences explaining why this candidate matches the role, citing CV evidence",
"recommendation":"one of: Strongly recommend for interview / Recommend for interview / Consider with reservations / Not a fit — plus a short reason",
"summary":"2 sentence profile summary"}`,
    );
    const parsed = parseJson<unknown>(raw, null);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("The AI returned an unreadable response. Please try again.");
    }
    const result = ScreenResult.parse(parsed);
    const candidateName = result.candidateName || result.name;
    if (!candidateName && result.skills.length === 0 && !result.summary) {
      throw new Error("No candidate details could be read from this CV.");
    }
    return { ...result, candidateName, name: candidateName, role: result.role || result.title };
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
