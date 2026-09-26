/**
 * Talento Demo Engine — local, deterministic replacement for AI-provider calls.
 * When DEMO_MODE is true no external AI/LLM is called and no AI credits are used.
 * To connect a real provider later, swap the implementation of these functions.
 */
import { CANDIDATES, JOBS, SKILL_LIBRARY } from "./data";
import { candidateToProfile, computeMatch, rankCandidates, rankJobs, toProfile } from "./matching";
import type { TalentoState } from "./store";
import type { Candidate, CvSection, Job, Role } from "./types";

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


/* ---------------- Career analysis ---------------- */

export interface CareerAnalysisInput {
  degree: string;
  major: string;
  university: string;
  years: number;
  skills: string[];
  certifications: string[];
  projects: string[];
  targetRole: string;
  jobs?: Job[];
}

const LEARN_WEEKS: Record<string, number> = {
  SQL: 3, Excel: 2, Python: 6, "Power BI": 3, Tableau: 3, Statistics: 5, "Machine Learning": 8,
  "Deep Learning": 8, Pandas: 3, NLP: 6, Java: 8, React: 5, TypeScript: 4, "Node.js": 5, Figma: 3,
  "UX Research": 4, "Cloud (AWS)": 6, Docker: 3, Communication: 4, "Data Visualization": 3,
};

export async function analyzeCareer(d: CareerAnalysisInput, onStep?: (s: string) => void) {
  for (const s of ["Analyzing your profile…", "Evaluating your skills…", "Comparing career requirements…"]) {
    onStep?.(s);
    await wait(400);
  }
  const jobs = d.jobs?.length ? d.jobs : JOBS;
  const profile: Profile = {
    skills: d.skills, education: d.degree, years: d.years, certifications: d.certifications, projects: d.projects.length,
  };
  const ranked = matchJobs(profile, jobs);
  const target =
    jobs.find((j) => j.title.toLowerCase() === d.targetRole.toLowerCase()) ?? ranked[0]?.job;
  const tm = target ? computeMatch(profile, target) : undefined;
  const paths = uniq(ranked.map((r) => r.job.title)).slice(0, 3);
  const pathScores = paths.map((p) => `${p} (${ranked.find((r) => r.job.title === p)!.match.score}%)`);

  const strengths = [
    tm?.matching.length ? `You already have ${tm.matching.length} of ${target!.skills.length} core ${target!.title} skills: ${tm.matching.join(", ")}.` : "",
    d.major ? `Your ${d.degree} in ${d.major}${d.university ? ` from ${d.university}` : ""} is relevant to ${paths[0] ?? "your target role"}.` : "",
    d.certifications.length ? `Certified in ${d.certifications.join(", ")}, which signals verified skills to employers.` : "",
    d.projects.length ? `${d.projects.length} project${d.projects.length === 1 ? "" : "s"} on your CV demonstrate hands-on practice.` : "",
    d.years ? `${d.years} year${d.years === 1 ? "" : "s"} of experience listed.` : "",
  ].filter(Boolean).slice(0, 4);

  const gaps = tm ? [...tm.missing, ...tm.improve] : [];
  const improvements = [
    ...(tm?.missing ?? []).map((s) => `${s} — required for ${target!.title} and not yet on your profile.`),
    tm && target!.minYears > d.years ? `Experience — ${target!.title} roles ask for ${target!.minYears}+ years; you list ${d.years}.` : "",
    !d.projects.length ? "Projects — add at least one project to show practical application of your skills." : "",
    !d.certifications.length && target?.certifications.length ? `Certification — employers for this role look for ${target.certifications[0]}.` : "",
  ].filter(Boolean).slice(0, 4);

  const recommendedSkills = gaps.slice(0, 4).map((skill) => ({
    skill,
    reason: tm!.missing.includes(skill)
      ? `Required by ${target!.title}; adds ${Math.round(40 / Math.max(1, target!.skills.length))}% to your match.`
      : `Preferred by ${target!.title} employers — helps you stand out.`,
    weeks: LEARN_WEEKS[skill] ?? 4,
  }));

  const nextSteps = [
    recommendedSkills[0] ? `Start learning ${recommendedSkills[0].skill} (about ${recommendedSkills[0].weeks} weeks).` : `Apply to ${paths[0]} roles — you meet the core requirements.`,
    `Build a project using ${[...(tm?.matching ?? d.skills).slice(0, 2), recommendedSkills[0]?.skill].filter(Boolean).join(" and ")} and add it to your CV.`,
    ranked[0] ? `Apply to ${ranked[0].job.title} at ${ranked[0].job.company} — your current best match at ${ranked[0].match.score}%.` : "",
  ].filter(Boolean);

  return {
    summary: `Your profile fits best with ${pathScores.join(", ")}. ${
      tm ? `For your goal of ${target!.title} you currently match ${tm.score}%${tm.missing.length ? `, with ${tm.missing.length} required skill${tm.missing.length === 1 ? "" : "s"} to close` : ""}.` : ""
    }`,
    strengths,
    improvements,
    recommendedSkills,
    nextSteps,
  };
}

/* ---------------- HR candidate search ---------------- */

export interface SearchCriteria {
  skills: string[];
  major: string;
  degree: string;
  location: string;
  university: string;
  name: string;
  minYears: number | null;
  maxYears: number | null;
  minGpa: number | null;
  availability: string;
  graduationYear: number | null;
  certifications: string[];
  interpretation: string;
}

const MAJORS = ["Computer Science", "Information Systems", "Software Engineering", "Data Science", "Artificial Intelligence", "AI", "Statistics", "Mathematics", "Business", "Design", "Engineering", "Information Technology", "Cybersecurity"];
const CITIES = ["Riyadh", "Jeddah", "Dammam", "Khobar", "Mecca", "Makkah", "Medina", "Remote"];

export function parseSearchQuery(query: string, candidates: Candidate[] = CANDIDATES): SearchCriteria {
  const q = query;
  const skillPool = uniq([...ALL_SKILLS, ...candidates.flatMap((c) => c.skills)]);
  const skills = skillPool.filter((s) => hasSkill(q, s) && !/^(ai)$/i.test(s));
  const major = MAJORS.find((m) => hasSkill(q, m)) ?? "";
  const degree = /master|msc/i.test(q) ? "Master's degree" : /phd/i.test(q) ? "PhD" : /bachelor|bsc|graduate/i.test(q) ? "Bachelor's degree" : "";
  const location = CITIES.find((c) => new RegExp(`\\b${c}\\b`, "i").test(q)) ?? "";
  const university = uniq(candidates.map((c) => c.university)).find((u) => q.toLowerCase().includes(u.toLowerCase())) ?? "";
  const name = candidates.find((c) => c.name.split(" ").some((n) => n.length > 2 && new RegExp(`\\b${n}\\b`, "i").test(q)))?.name ?? "";
  const plus = q.match(/(\d+)\s*\+\s*(?:years|yrs)|(?:at least|minimum|over)\s*(\d+)\s*(?:years|yrs)/i);
  const upTo = q.match(/(?:up to|max(?:imum)?|less than|under)\s*(\d+)\s*(?:years|yrs)/i);
  const fresh = /fresh|entry|junior|new grad/i.test(q);
  const minYears = plus ? Number(plus[1] ?? plus[2]) : /senior/i.test(q) ? 3 : null;
  const maxYears = upTo ? Number(upTo[1]) : fresh ? 1 : null;
  const gpaM = q.match(/gpa\s*(?:above|over|of|>=?|at least)?\s*([\d.]+)/i);
  const minGpa = gpaM ? Number(gpaM[1]) : null;
  const availability = /immediate/i.test(q) ? "Immediately" : /1 month|one month/i.test(q) ? "1 month" : /3 months/i.test(q) ? "3 months" : "";
  const grad = q.match(/(?:graduat\w*|class of)\s*(?:in\s*)?((?:19|20)\d{2})/i);
  const certifications = uniq(candidates.flatMap((c) => c.certifications)).filter((c) => q.toLowerCase().includes(c.toLowerCase()));
  const parts = [
    skills.length && `skills ${skills.join(", ")}`,
    major && `major ${major}`,
    degree && degree,
    university && university,
    location && `in ${location}`,
    minYears !== null && `${minYears}+ years`,
    maxYears !== null && `up to ${maxYears} years`,
    minGpa !== null && `GPA ≥ ${minGpa}`,
    availability && `available ${availability.toLowerCase()}`,
    certifications.length && certifications.join(", "),
    name && `name ${name}`,
  ].filter(Boolean);
  return {
    skills, major, degree, location, university, name, minYears, maxYears, minGpa, availability,
    graduationYear: grad ? Number(grad[1]) : null, certifications,
    interpretation: parts.length
      ? `Looking for candidates with ${parts.join(" · ")}. Each requirement counts equally toward the match score.`
      : "No specific requirement was recognised — showing all candidates. Try naming skills, a major, location or years.",
  };
}

const gpaNum = (g: string) => Number(g.match(/[\d.]+/)?.[0] ?? 0);

export async function searchCandidates(query: string, candidates: Candidate[] = CANDIDATES, onStep?: (s: string) => void) {
  for (const s of ["Reading your request…", "Matching requirements…", "Ranking candidates…"]) {
    onStep?.(s);
    await wait(300);
  }
  const c = parseSearchQuery(query, candidates);
  const results = candidates.map((cand) => {
    const matched: string[] = [];
    const missing: string[] = [];
    const check = (label: string, ok: boolean) => (ok ? matched : missing).push(label);
    const lowerSkills = cand.skills.map((s) => s.toLowerCase());
    c.skills.forEach((s) => check(s, lowerSkills.includes(s.toLowerCase())));
    if (c.major) check(c.major, `${cand.major} ${cand.degree}`.toLowerCase().includes(c.major.toLowerCase()) || (c.major === "AI" && /artificial|ai\b/i.test(cand.major)));
    if (c.degree) check(c.degree, cand.degree.toLowerCase() === c.degree.toLowerCase() || (c.degree === "Bachelor's degree" && /master|phd/i.test(cand.degree)));
    if (c.university) check(c.university, cand.university === c.university);
    if (c.location) check(c.location, cand.location.toLowerCase().includes(c.location.toLowerCase()));
    if (c.minYears !== null) check(`${c.minYears}+ years`, cand.years >= c.minYears);
    if (c.maxYears !== null) check(`≤ ${c.maxYears} years`, cand.years <= c.maxYears);
    if (c.minGpa !== null) check(`GPA ≥ ${c.minGpa}`, gpaNum(cand.gpa) >= c.minGpa);
    if (c.availability) check(`Available ${c.availability.toLowerCase()}`, cand.availability === c.availability);
    if (c.graduationYear) check(`Graduated ${c.graduationYear}`, cand.graduationYear === c.graduationYear);
    c.certifications.forEach((x) => check(x, cand.certifications.includes(x)));
    if (c.name) check(c.name, cand.name === c.name);
    const total = matched.length + missing.length;
    return { candidate: cand, matched, missing, score: total ? Math.round((matched.length / total) * 100) : 0 };
  });
  const total = results[0] ? results[0].matched.length + results[0].missing.length : 0;
  const filtered = total ? results.filter((r) => r.matched.length > 0) : results;
  return { criteria: c, results: filtered.sort((a, b) => b.score - a.score) };
}

/* ---------------- Job post ---------------- */

export interface JobPostInput {
  title: string;
  notes: string;
  location: string;
  type: string;
  level?: string;
  education: string;
  skills: string;
  experience: string;
  certifications: string;
  company?: string;
}

const pick = <T,>(list: T[], seed: string) => list[[...seed].reduce((a, ch) => a + ch.charCodeAt(0), 0) % list.length]!;

export async function generateJobPost(d: JobPostInput, onStep?: (s: string) => void) {
  for (const s of ["Reading role details…", "Structuring the job post…", "Polishing the wording…"]) {
    onStep?.(s);
    await wait(350);
  }
  const skills = splitList(d.skills);
  const certs = splitList(d.certifications);
  const noteItems = d.notes.split(/\n|;|\.\s/).map((s) => s.trim()).filter((s) => s.length > 3);
  const seed = d.title + d.skills;
  const company = d.company || "our team";
  const intro = pick([
    `${company} is hiring a ${d.title} to join us${d.location ? ` in ${d.location}` : ""}.`,
    `We are looking for a ${d.title} to strengthen ${company}${d.location ? ` in ${d.location}` : ""}.`,
    `Join ${company} as a ${d.title}${d.location ? ` based in ${d.location}` : ""}.`,
  ], seed);
  const body = pick([
    `This ${d.type.toLowerCase()} role${d.level ? ` (${d.level.toLowerCase()})` : ""} centres on ${skills.slice(0, 3).join(", ")}.`,
    `In this ${d.type.toLowerCase()} position you will put your ${skills.slice(0, 3).join(", ")} skills to daily use.`,
    `The ideal candidate brings strong ${skills.slice(0, 3).join(", ")} skills to a ${d.type.toLowerCase()} role.`,
  ], seed + "b");
  const verbs = ["Apply", "Use", "Contribute with", "Deliver work using"];
  const responsibilities = noteItems.length
    ? noteItems.slice(0, 6).map((n) => polish(n))
    : skills.slice(0, 4).map((s, i) => `${verbs[i % verbs.length]} ${s} in day-to-day work as ${d.title}.`);
  const requirements = [
    d.education && `${d.education} or equivalent.`,
    d.experience && `${d.experience} of relevant experience.`,
    skills.length && `Working knowledge of ${skills.join(", ")}.`,
    certs.length && `${certs.join(", ")} certification${certs.length > 1 ? "s" : ""}.`,
  ].filter(Boolean) as string[];
  return {
    description: `${intro} ${body}\n\nLocation: ${d.location || "Not specified"} · Type: ${d.type} · Experience: ${d.experience || "Not specified"}.`,
    responsibilities,
    requirements,
    skills,
    preferredSkills: certs,
  };
}

/* ---------------- Candidate match explanation ---------------- */

export async function explainCandidateMatch(candidate: Candidate, job: Job, onStep?: (s: string) => void) {
  for (const s of ["Matching requirements…", "Evaluating skills…", "Preparing recommendations…"]) {
    onStep?.(s);
    await wait(300);
  }
  const m = computeMatch(candidateToProfile(candidate), job);
  const expOk = candidate.years >= job.minYears;
  const eduOk = m.dimensions.find((d) => d.label === "Education")!.score >= 1;
  const majorOk = job.title.toLowerCase().split(/\s+/).some((w) => w.length > 3 && candidate.major.toLowerCase().includes(w)) ||
    job.skills.some((s) => candidate.major.toLowerCase().includes(s.toLowerCase())) || /computer|data|software|information|engineering|ai|artificial/i.test(candidate.major);
  const strong = [
    ...m.matching.map((s) => `✓ ${s}`),
    expOk ? `✓ Experience: meets the ${job.minYears}+ year requirement (${candidate.years} yrs)` : "",
    eduOk ? `✓ Education: ${candidate.degree} meets the ${job.education} requirement` : "",
    majorOk ? `✓ Major: ${candidate.major} is relevant to ${job.title}` : "",
  ].filter(Boolean);
  const risks = [
    ...m.missing.map((s) => `⚠ Missing required skill: ${s}`),
    !expOk ? `⚠ Experience: ${candidate.years} yrs vs ${job.minYears}+ required` : "",
    !eduOk ? `⚠ Education: role asks for ${job.education}` : "",
  ].filter(Boolean);
  const recommendation = m.missing.length === 0 && expOk
    ? "Invite to interview — all required skills and experience are met."
    : m.score >= 65
      ? `Interview and assess ${[...m.missing, !expOk ? "depth of experience" : ""].filter(Boolean).join(", ")} with a practical task.`
      : `Keep on file — close gaps in ${m.missing.slice(0, 2).join(", ") || "experience"} before moving forward.`;
  return {
    verdict: `${m.score}% match for ${job.title}: ${m.matching.length} of ${job.skills.length} required skills present${m.missing.length ? `, ${m.missing.length} missing` : ""}.`,
    strong: strong.length ? strong : ["No required skills matched yet."],
    risks: risks.length ? risks : ["✓ No gaps found against the job requirements."],
    recommendation,
  };
}

export const demoEngine = {
  analyzeCV,
  generateCV,
  answerAssistant,
  matchJobs,
  calculateSkillGaps,
  calculateMatchScore,
  analyzeCareer,
  searchCandidates,
  generateJobPost,
  explainCandidateMatch,
};
