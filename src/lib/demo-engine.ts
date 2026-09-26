/**
 * Talento Demo Engine — local, deterministic replacement for AI-provider calls.
 * When DEMO_MODE is true no external AI/LLM is called and no AI credits are used.
 * To connect a real provider later, swap the implementation of these functions.
 */
import { CANDIDATES, JOBS, SKILL_LIBRARY } from "./data";
import { computeMatch, rankCandidates, rankJobs, toProfile } from "./matching";
import type { TalentoState } from "./store";
import type { CvSection, Job, Role } from "./types";

export const DEMO_MODE = true;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const uniq = (list: string[]) => {
  const seen = new Set<string>();
  return list.filter((s) => {
    const k = s.toLowerCase();
    if (!s || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};
const splitList = (s: string) =>
  uniq(
    s
      .split(/[,،;\n•·|]+/)
      .map((x) => x.trim().replace(/^[-*]\s*/, ""))
      .filter(Boolean),
  );

/* ---------------- Match helpers ---------------- */

type Profile = Parameters<typeof computeMatch>[0];

export function calculateMatchScore(profile: Profile, job: Job) {
  return computeMatch(profile, job).score;
}

export function calculateSkillGaps(skills: string[], job: Job) {
  const owned = new Set(skills.map((s) => s.toLowerCase()));
  return {
    matched: job.skills.filter((s) => owned.has(s.toLowerCase())),
    missing: job.skills.filter((s) => !owned.has(s.toLowerCase())),
    preferredMissing: job.preferredSkills.filter((s) => !owned.has(s.toLowerCase())),
  };
}

export function matchJobs(profile: Profile, jobs: Job[] = JOBS) {
  return rankJobs(profile, jobs.filter((j) => j.status !== "Closed"));
}

/* ---------------- CV screening ---------------- */

export interface ScreenedCv {
  candidateName: string;
  name: string;
  title: string;
  role: string;
  matchPercentage: number;
  degree: string;
  major: string;
  university: string;
  gpa: string;
  graduationYear: number | null;
  location: string;
  years: number;
  skills: string[];
  certifications: string[];
  languages: string[];
  strengths: string[];
  skillGaps: string[];
  concerns: string[];
  relevantExperience: string[];
  education: string;
  experience: string;
  projects: { name: string; description: string }[];
  explanation: string;
  recommendation: string;
  summary: string;
}

const EXTRA_SKILLS = [
  "JavaScript", "HTML", "CSS", "C++", "C#", "PHP", "Kotlin", "Swift", "Flutter", "R", "MATLAB",
  "Git", "Linux", "Azure", "Google Cloud", "Kubernetes", "TensorFlow", "PyTorch", "Scikit-learn",
  "Spark", "MongoDB", "PostgreSQL", "MySQL", "Agile", "Scrum", "Leadership", "Teamwork",
  "Data Analysis", "Computer Vision", "Cybersecurity", "Networking", "Accounting", "Marketing",
  "Sales", "Customer Service", "AutoCAD", "SAP", "Photoshop", "Illustrator", "Research",
];
const ALL_SKILLS = uniq([...SKILL_LIBRARY, ...EXTRA_SKILLS]);

const SECTION_RE: Record<string, RegExp> = {
  education: /^(education|academic|qualifications?|التعليم|المؤهلات)/i,
  experience: /^(work experience|experience|employment|internships?|professional experience|الخبرات?|الخبرة)/i,
  projects: /^(projects?|المشاريع)/i,
  certifications: /^(certifications?|certificates?|licen[cs]es|courses|الشهادات)/i,
  skills: /^(skills|technical skills|competencies|المهارات)/i,
  languages: /^(languages?|اللغات)/i,
  summary: /^(summary|profile|objective|about|نبذة|الملخص)/i,
};

function splitSections(lines: string[]) {
  const sections: Record<string, string[]> = { header: [] };
  let current = "header";
  for (const line of lines) {
    const heading = line.replace(/[:：]\s*$/, "").trim();
    const hit = heading.length < 40 && Object.entries(SECTION_RE).find(([, re]) => re.test(heading));
    if (hit) {
      current = hit[0];
      sections[current] ??= [];
      const rest = line.replace(hit[1], "").replace(/^[\s:：-]+/, "").trim();
      if (rest) sections[current]!.push(rest);
      continue;
    }
    (sections[current] ??= []).push(line);
  }
  return sections;
}

const hasSkill = (text: string, skill: string) => {
  const esc = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^\\p{L}\\p{N}+#])${esc}($|[^\\p{L}\\p{N}+#])`, "iu").test(text);
};

function estimateYears(text: string, expLines: string[]) {
  const explicit = text.match(/(\d{1,2})\+?\s*(years?|yrs|سنوات|سنة)/i);
  if (explicit) return Math.min(40, Number(explicit[1]));
  const now = new Date().getFullYear();
  let months = 0;
  for (const l of expLines) {
    const m = l.match(/((?:19|20)\d{2})\s*[-–—to]+\s*((?:19|20)\d{2}|present|current|now|الآن|حاليا)/i);
    if (m) {
      const end = /\d/.test(m[2]!) ? Number(m[2]) : now;
      months += Math.max(3, (end - Number(m[1])) * 12);
    }
  }
  return Math.round((months / 12) * 10) / 10;
}

function guessName(header: string[], fileName: string) {
  for (const l of header.slice(0, 6)) {
    const c = l.replace(/^(name|الاسم)\s*[:：]\s*/i, "").trim();
    if (/[@\d]|https?:/.test(c)) continue;
    const words = c.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && /^[\p{L}\s.'-]+$/u.test(c) && !/curriculum|resume|cv\b|سيرة/i.test(c))
      return c;
  }
  const base = fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\b(cv|resume)\b/gi, "").trim();
  return base ? `${base} (DEMO)` : "Unnamed candidate (DEMO)";
}

export async function analyzeCV(
  input: { text: string; fileName: string; targetRole?: string; jobs?: Job[] },
  onStep?: (step: string) => void,
): Promise<ScreenedCv> {
  const steps = ["Screening CV…", "Extracting candidate information…", "Structuring profile…", "Matching qualifications…"];
  for (const s of steps) {
    onStep?.(s);
    await wait(350);
  }
  const text = input.text;
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const sec = splitSections(lines);
  const eduText = (sec["education"] ?? lines).join("\n");

  const candidateName = guessName(sec["header"]?.length ? sec["header"]! : lines, input.fileName);
  const uniLine = lines.find((l) => /university|college|institute|school of|جامعة|كلية|معهد/i.test(l)) ?? "";
  const university = (uniLine.match(/([\p{L}.'&\s]*(university|college|institute)[\p{L}.'&\s]*|(جامعة|كلية|معهد)[\p{L}\s]*)/iu)?.[0] ?? "").trim();
  const degreeLine =
    lines.find((l) => /bachelor|master|ph\.?d|b\.?sc|m\.?sc|b\.?a\b|diploma|بكالوريوس|ماجستير|دكتوراه|دبلوم/i.test(l)) ?? "";
  const degree = /ph\.?d|دكتوراه/i.test(degreeLine)
    ? "PhD"
    : /master|m\.?sc|ماجستير/i.test(degreeLine)
      ? "Master's degree"
      : /diploma|دبلوم/i.test(degreeLine)
        ? "Diploma"
        : degreeLine
          ? "Bachelor's degree"
          : "";
  const major = (degreeLine.match(/\b(?:in|of)\s+([\p{L}&\s]{3,50}?)(?=[,(|\-–—]|\s+(?:from|at)\b|$)/iu)?.[1] ??
    degreeLine.match(/(?:تخصص|في)\s+([\p{L}\s]{3,40})/u)?.[1] ?? "").trim();
  const gpa = (text.match(/(?:GPA|المعدل)\s*[:：]?\s*([\d.]+\s*(?:\/\s*[\d.]+)?)/i)?.[1] ?? "").replace(/\s+/g, " ");
  const years = eduText.match(/(?:19|20)\d{2}/g)?.map(Number) ?? [];
  const graduationYear = years.length ? Math.max(...years) : null;
  const location = (text.match(/\b(Riyadh|Jeddah|Dammam|Khobar|Mecca|Makkah|Medina|Dubai|Abu Dhabi|Doha|Kuwait|Manama|Muscat|Cairo|الرياض|جدة|الدمام|الخبر|مكة|المدينة)\b[\p{L},\s]*/iu)?.[0] ?? "").trim().replace(/[,\s]+$/, "");

  const skills = ALL_SKILLS.filter((s) => hasSkill(text, s)).slice(0, 14);
  const certLines = sec["certifications"] ?? lines.filter((l) => /certif|certified|شهادة/i.test(l));
  const certifications = uniq(certLines.flatMap(splitList)).filter((c) => c.length < 90).slice(0, 8);
  const languages = uniq(
    (sec["languages"] ?? []).flatMap(splitList).concat(
      ["Arabic", "English", "French", "Urdu", "Hindi", "Spanish", "German"].filter((l) =>
        new RegExp(`\\b${l}\\b`, "i").test(text),
      ),
    ),
  ).slice(0, 6);
  const expLines = sec["experience"] ?? [];
  const relevantExperience = expLines.filter((l) => l.length > 8).slice(0, 4);
  const projects = (sec["projects"] ?? []).slice(0, 4).map((l) => {
    const [name, ...rest] = l.split(/\s[-–—:]\s|:\s/);
    return { name: (name ?? l).trim(), description: rest.join(" — ").trim() };
  });
  const yearsExp = estimateYears(text, expLines);

  // Match against the target role or best-fitting local job
  const jobs = input.jobs?.length ? input.jobs : JOBS;
  const profile: Profile = {
    skills,
    education: degree || "Bachelor's degree",
    years: yearsExp,
    certifications,
    projects: projects.length,
  };
  const target = input.targetRole
    ? jobs.find((j) => j.title.toLowerCase().includes(input.targetRole!.toLowerCase()))
    : undefined;
  const best = target ? { job: target, match: computeMatch(profile, target) } : rankJobs(profile, jobs)[0]!;
  const { job, match } = best;

  const strengths = [
    match.matching.length ? `Has ${match.matching.length} of ${job.skills.length} required skills: ${match.matching.join(", ")}.` : "",
    degree ? `${degree}${major ? ` in ${major}` : ""}${university ? ` from ${university}` : ""}.` : "",
    yearsExp ? `${yearsExp} year${yearsExp === 1 ? "" : "s"} of experience listed.` : "",
    certifications.length ? `Certifications: ${certifications.slice(0, 3).join(", ")}.` : "",
    projects.length ? `${projects.length} project${projects.length === 1 ? "" : "s"} described in the CV.` : "",
  ].filter(Boolean).slice(0, 4);
  const concerns = [
    job.minYears > yearsExp ? `Role asks for ${job.minYears}+ years; CV shows ${yearsExp}.` : "",
    !degree ? "No degree could be read from the CV." : "",
    skills.length < 3 ? "Few recognisable skills were found in the CV." : "",
  ].filter(Boolean);
  const recommendation =
    match.score >= 80
      ? "Strongly recommend for interview — meets most requirements."
      : match.score >= 65
        ? "Recommend for interview — good fit with some gaps."
        : match.score >= 45
          ? "Consider with reservations — several requirements are missing."
          : "Not a fit — key requirements are missing for this role.";

  return {
    candidateName,
    name: candidateName,
    title: job.title,
    role: job.title,
    matchPercentage: match.score,
    degree,
    major,
    university,
    gpa,
    graduationYear,
    location,
    years: yearsExp,
    skills,
    certifications,
    languages,
    strengths,
    skillGaps: match.missing.slice(0, 4),
    concerns,
    relevantExperience,
    education: [degree, major && `in ${major}`, university && `— ${university}`, graduationYear && `(${graduationYear})`]
      .filter(Boolean)
      .join(" "),
    experience: relevantExperience.join(" · "),
    projects,
    explanation: `Matches ${match.matching.length} of ${job.skills.length} required skills for ${job.title}${
      match.matching.length ? ` (${match.matching.join(", ")})` : ""
    }. ${match.missing.length ? `Missing: ${match.missing.join(", ")}.` : "All required skills are present."}`,
    recommendation,
    summary: `${candidateName.replace(" (DEMO)", "")}${degree ? `, ${degree}${major ? ` in ${major}` : ""}` : ""}${
      skills.length ? `, skilled in ${skills.slice(0, 4).join(", ")}` : ""
    }. Best fit: ${job.title} (${match.score}% match).`,
  };
}

/* ---------------- CV generation ---------------- */

export interface CvAnswers {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  targetRole: string;
  education: string;
  experience: string;
  skills: string;
  projects: string;
  certifications: string;
  languages: string;
}

const cap = (s: string) => (s ? s[0]!.toUpperCase() + s.slice(1) : s);
const ACTION_VERBS: [RegExp, string][] = [
  [/^(made|did|worked on)\s+/i, "Delivered "],
  [/^(helped( with)?)\s+/i, "Supported "],
  [/^(was responsible for|responsible for)\s+/i, "Led "],
  [/^(built|created)\s+/i, "Built "],
];
const polish = (s: string) => {
  let out = s.trim().replace(/\s+/g, " ");
  for (const [re, verb] of ACTION_VERBS) out = out.replace(re, verb);
  out = cap(out);
  return out && !/[.!?]$/.test(out) ? `${out}.` : out;
};

export async function generateCV(a: CvAnswers, onStep?: (step: string) => void): Promise<CvSection> {
  for (const s of ["Preparing your CV…", "Organizing your information…", "Formatting your experience…", "Creating your professional CV…"]) {
    onStep?.(s);
    await wait(450);
  }
  const education = a.education
    .split(/\n|;/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split(/,|،/).map((p) => p.trim()).filter(Boolean);
      const gpa = l.match(/GPA\s*[:：]?\s*([\d.]+\s*(?:\/\s*[\d.]+)?)/i)?.[1]?.trim() ?? "";
      const period = l.match(/(?:19|20)\d{2}(?:\s*[-–]\s*(?:(?:19|20)\d{2}|present))?/i)?.[0] ?? "";
      const school = parts.find((p) => /university|college|institute|school|جامعة|كلية/i.test(p)) ?? parts[1] ?? "";
      return { degree: parts[0] ?? l, school: school === parts[0] ? "" : school, period, gpa };
    });
  const experience = a.experience
    .split(/\n|;/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [head, ...rest] = l.split(/\s[-–—]\s/);
      const h = head ?? l;
      const period = h.match(/((?:summer|spring|fall|winter)\s+)?(?:19|20)\d{2}(?:\s*[-–]\s*(?:(?:19|20)\d{2}|present))?/i)?.[0] ?? "";
      const hNoPeriod = h.replace(period, "").replace(/[,\s]+$/, "");
      const m = hNoPeriod.match(/^(.*?)\s+(?:at|@|in|لدى|في)\s+(.*)$/i);
      return {
        role: cap((m?.[1] ?? hNoPeriod).trim()),
        company: (m?.[2] ?? "").replace(/,.*$/, "").trim(),
        period: period.trim(),
        summary: rest.length ? polish(rest.join(" — ")) : "",
      };
    });
  const projects = a.projects
    .split(/\n|;/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [name, ...rest] = l.split(/\s[-–—:]\s|:\s/);
      return { name: cap((name ?? l).trim()), description: rest.length ? polish(rest.join(" — ")) : polish(l) };
    });
  const skills = splitList(a.skills);
  const certifications = splitList(a.certifications);
  const languages = splitList(a.languages);
  const role = a.targetRole.trim();
  const edu = education[0];
  const summary = [
    role ? `Aspiring ${role}` : "Motivated professional",
    edu ? ` with a ${edu.degree}${edu.school ? ` from ${edu.school}` : ""}` : "",
    skills.length ? `, skilled in ${skills.slice(0, 4).join(", ")}` : "",
    ".",
    experience.length ? ` Brings hands-on experience as ${experience[0]!.role}${experience[0]!.company ? ` at ${experience[0]!.company}` : ""}.` : "",
    projects.length ? ` Has delivered ${projects.length} project${projects.length === 1 ? "" : "s"}, including ${projects[0]!.name}.` : "",
    certifications.length ? ` Certified in ${certifications.slice(0, 2).join(" and ")}.` : "",
  ].join("");

  return {
    personal: { fullName: a.fullName, title: role, email: a.email, phone: a.phone, location: a.location, summary },
    education,
    skills,
    experience,
    projects,
    certifications,
    languages,
  };
}

/* ---------------- Assistant ---------------- */

const has = (q: string, re: RegExp) => re.test(q);

export async function answerAssistant(role: Role, question: string, state: TalentoState): Promise<string> {
  await wait(600);
  const q = question.toLowerCase();
  const profile = toProfile(state.seeker, state.cv.projects.length || 1);
  const targetJob =
    state.jobs.find((j) => j.title.toLowerCase() === state.targetRole.toLowerCase()) ??
    state.jobs.find((j) => j.title.toLowerCase().includes(state.targetRole.toLowerCase().split(" ")[0] ?? ""));

  if (role === "seeker") {
    if (has(q, /edit|update|change|builder|template|تعديل|سيرت/) && has(q, /cv|resume|سيرة|سيرت/))
      return "To edit your CV, open the CV tab in the bottom navigation, then tap Open builder. You can re-create it with AI, upload a new file, or edit every section manually. Your template (currently " +
        state.cvTemplate + ") can be switched on the CV page, and Download PDF exports the latest saved version.";
    if (has(q, /match|%|percent|score|نسبة|تطابق/)) {
      const top = matchJobs(profile, state.jobs)[0];
      return `Your Match % compares your profile with each job: required skills (40%), education (18%), experience (18%), preferred skills (12%), certifications (7%) and projects (5%). Required skills are scored as matched ÷ total required.${
        top ? ` Example: for ${top.job.title} you match ${top.match.matching.length} of ${top.job.skills.length} required skills, giving ${top.match.score}%.` : ""
      }`;
    }
    if (has(q, /gap|missing|فجوة|ناقص/)) {
      if (!targetJob) return "Career Gap Analysis compares your skills with the required skills of your target role and lists what is missing. Set a target role on the Career Gap page to see it.";
      const g = calculateSkillGaps(state.seeker.skills, targetJob);
      return `Career Gap Analysis compares your skills with ${targetJob.title}. You have ${g.matched.length} of ${targetJob.skills.length} required skills${g.matched.length ? ` (${g.matched.join(", ")})` : ""}. ${
        g.missing.length ? `Missing: ${g.missing.join(", ")}.` : "No required skills are missing."
      } Open More → Career gap analysis for the full breakdown.`;
    }
    if (has(q, /job|suitable|find|apply|وظيف|عمل/)) {
      const top = matchJobs(profile, state.jobs).slice(0, 3);
      return `Based on your skills (${state.seeker.skills.slice(0, 4).join(", ")}), your best matches are:\n${top
        .map((t) => `• ${t.job.title} at ${t.job.company} — ${t.match.score}%`)
        .join("\n")}\nOpen the Jobs tab and sort by Best match to see them all.`;
    }
    if (has(q, /path|career|future|مسار|مهني/)) {
      const job = targetJob ?? matchJobs(profile, state.jobs)[0]?.job;
      if (!job) return "Your Career Path shows step-by-step milestones towards your target role.";
      const g = calculateSkillGaps(state.seeker.skills, job);
      const steps = [...g.missing, ...g.preferredMissing].slice(0, 3);
      return `Your Career Path leads from ${state.seeker.major} towards ${job.title}. ${
        steps.length ? `Next steps: ${steps.map((s, i) => `${i + 1}) learn ${s}`).join(", ")}.` : "You already cover the core skills — focus on projects and applying."
      } You're ${state.pathProgress}% through your path.`;
    }
    if (has(q, /application|status|طلب/))
      return `You have ${state.applications.length} application${state.applications.length === 1 ? "" : "s"}. Open the Application tab to filter by status and view each timeline.`;
  } else {
    if (has(q, /screen|upload|cv|فرز/))
      return "Open AI CV Screening from the Home page, tap Choose files and select one or more CVs (PDF, DOC, DOCX, TXT or images). Each CV is read, structured and matched to your roles; then search results by name, university, major or skill.";
    if (has(q, /match|%|score|نسبة/))
      return "Candidate Match % compares each candidate to a job: required skills (40%, matched ÷ total required), education (18%), experience (18%), preferred skills (12%), certifications (7%) and projects (5%). Open a candidate profile to see the breakdown.";
    if (has(q, /publish|post|new job|create job|نشر|وظيفة/))
      return "Go to Jobs → Post a job, fill in title, location, type, education, skills and experience, then publish. It appears in your Job Management list right away.";
    if (has(q, /applicant|manage|stage|shortlist|متقدم/))
      return "Open a job and tap View applicants. Filter by status and change each applicant's stage (Applied, Under Review, Shortlisted, Interview, Rejected, Hired) from their card.";
    if (has(q, /search|candidate|find|مرشح|بحث/)) {
      const job = state.jobs.find((j) => j.status === "Active") ?? state.jobs[0];
      const top = job ? rankCandidates(job, CANDIDATES).slice(0, 3) : [];
      return `Open the Candidates tab, use search, Filters and "Match against" to rank by a job.${
        job ? ` Top matches for ${job.title}: ${top.map((t) => `${t.candidate.name} (${t.match.score}%)`).join(", ")}.` : ""
      }`;
    }
  }
  return role === "seeker"
    ? "I can help with editing your CV, understanding Match %, Career Gap Analysis, finding suitable jobs, your Career Path and applications. Try asking about one of these."
    : "I can help with searching candidates, AI CV Screening, Match %, publishing jobs and managing applicants. Try asking about one of these.";
}

export const demoEngine = {
  analyzeCV,
  generateCV,
  answerAssistant,
  matchJobs,
  calculateSkillGaps,
  calculateMatchScore,
};
