import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CANDIDATES,
  JOBS,
  SEED_APPLICATIONS,
  defaultCompany,
  defaultCv,
  defaultSeeker,
} from "./data";
import type {
  Application,
  ApplicationStatus,
  CompanyProfile,
  CvSection,
  Job,
  Role,
  SeekerProfile,
} from "./types";

const KEY = "talento-state-v1";

export interface Session {
  name: string;
  email: string;
  role: Role;
  verified: boolean;
}

export interface TalentoState {
  session: Session | null;
  pendingRole: Role | null;
  seeker: SeekerProfile;
  company: CompanyProfile;
  cv: CvSection;
  cvSource: "ai" | "upload" | "manual" | null;
  cvTemplate: string;
  savedJobs: string[];
  viewedJobs: string[];
  applications: Application[];
  jobs: Job[];
  savedCandidates: string[];
  candidateStages: Record<string, ApplicationStatus>;
  pathProgress: number;
  targetRole: string;
  notifications: { id: string; title: string; body: string; when: string; read: boolean }[];
}

const initialState: TalentoState = {
  session: null,
  pendingRole: null,
  seeker: defaultSeeker,
  company: defaultCompany,
  cv: defaultCv(defaultSeeker),
  cvSource: "ai",
  cvTemplate: "modern",
  savedJobs: ["job-ai-engineer"],
  viewedJobs: ["job-data-analyst", "job-junior-data-scientist"],
  applications: SEED_APPLICATIONS,
  jobs: JOBS,
  savedCandidates: ["cand-sara", "cand-lina"],
  candidateStages: {
    "cand-sara": "Shortlisted",
    "cand-omar": "Interview",
    "cand-lina": "Under Review",
    "cand-khalid": "Rejected",
    "cand-noura": "Applied",
    "cand-rayed": "Applied",
  },
  pathProgress: 1,
  targetRole: "Data Analyst",
  notifications: [
    {
      id: "n1",
      title: "You were shortlisted",
      body: "Nana shortlisted your application for Product Analyst — Internship.",
      when: "2 days ago",
      read: false,
    },
    {
      id: "n2",
      title: "3 new jobs match your profile",
      body: "New roles above 80% match were published this week.",
      when: "4 days ago",
      read: true,
    },
  ],
};

interface Ctx {
  state: TalentoState;
  set: (patch: Partial<TalentoState>) => void;
  update: (fn: (s: TalentoState) => TalentoState) => void;
  reset: () => void;
  hydrated: boolean;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TalentoState>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initialState, ...(JSON.parse(raw) as TalentoState) });
    } catch {
      /* ignore corrupted state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, hydrated]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      hydrated,
      set: (patch) => setState((s) => ({ ...s, ...patch })),
      update: (fn) => setState((s) => fn(s)),
      reset: () => {
        setState(initialState);
        try {
          localStorage.removeItem(KEY);
        } catch {
          /* ignore */
        }
      },
    }),
    [state, hydrated],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function cvCompletion(cv: CvSection) {
  const checks = [
    !!cv.personal.fullName,
    !!cv.personal.summary,
    cv.education.length > 0,
    cv.skills.length >= 5,
    cv.experience.length > 0,
    cv.projects.length > 0,
    cv.certifications.length > 0,
    cv.languages.length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function profileCompletion(p: SeekerProfile) {
  const checks = [
    !!p.fullName,
    !!p.email,
    !!p.phone,
    !!p.university,
    !!p.major,
    !!p.gpa,
    p.skills.length >= 5,
    p.certifications.length > 0,
    p.languages.length > 0,
    !!p.location,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export const ALL_CANDIDATES = CANDIDATES;
