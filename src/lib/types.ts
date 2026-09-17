export type Role = "seeker" | "employer";

export type ApplicationStatus =
  | "Applied"
  | "Under Review"
  | "Shortlisted"
  | "Interview"
  | "Rejected"
  | "Hired";

export type JobStatus = "Active" | "Draft" | "Closed";

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  type: "Full-time" | "Part-time" | "Internship" | "Contract" | "Remote";
  level: "Entry level" | "Mid level" | "Senior";
  salary?: string;
  posted: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  skills: string[];
  preferredSkills: string[];
  education: string;
  minYears: number;
  certifications: string[];
  status: JobStatus;
  applicants: number;
  shortlisted: number;
  interviews: number;
  hired: number;
}

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  title: string;
  degree: string;
  major: string;
  university: string;
  gpa: string;
  graduationYear: number;
  location: string;
  availability: "Immediately" | "1 month" | "3 months";
  years: number;
  skills: string[];
  certifications: string[];
  languages: string[];
  projects: { name: string; description: string }[];
  experience: { role: string; company: string; period: string; summary: string }[];
  summary: string;
}

export interface CvSection {
  personal: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  education: { degree: string; school: string; period: string; gpa: string }[];
  skills: string[];
  experience: { role: string; company: string; period: string; summary: string }[];
  projects: { name: string; description: string }[];
  certifications: string[];
  languages: string[];
}

export interface Application {
  id: string;
  jobId: string;
  status: ApplicationStatus;
  appliedAt: string;
  timeline: { label: string; date: string; done: boolean }[];
}

export interface SeekerProfile {
  fullName: string;
  email: string;
  title: string;
  degree: string;
  major: string;
  university: string;
  gpa: string;
  graduationYear: number;
  location: string;
  years: number;
  skills: string[];
  certifications: string[];
  languages: string[];
  phone: string;
}

export interface CompanyProfile {
  name: string;
  industry: string;
  size: string;
  website: string;
  location: string;
  description: string;
  team: { name: string; role: string; email: string }[];
}
