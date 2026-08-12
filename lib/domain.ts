export type Role = "CANDIDATE" | "RECRUITER" | "HIRING_MANAGER" | "INTERVIEWER" | "ADMIN";
export type Stage = "APPLIED" | "RESUME_SCREENING" | "SHORTLISTED" | "TECHNICAL_INTERVIEW" | "HR_INTERVIEW" | "OFFER" | "HIRED" | "REJECTED";

export const stages: { key: Stage; label: string; accent: string }[] = [
  { key: "APPLIED", label: "Applied", accent: "slate" },
  { key: "RESUME_SCREENING", label: "Resume screening", accent: "violet" },
  { key: "SHORTLISTED", label: "Shortlisted", accent: "blue" },
  { key: "TECHNICAL_INTERVIEW", label: "Technical interview", accent: "amber" },
  { key: "HR_INTERVIEW", label: "HR interview", accent: "pink" },
  { key: "OFFER", label: "Offer", accent: "teal" },
  { key: "HIRED", label: "Hired", accent: "green" },
];

export const demoApplicants = [
  { id: "a1", name: "Maya Patel", initials: "MP", role: "Senior Frontend Engineer", score: 91, stage: "SHORTLISTED" as Stage, skills: ["React", "TypeScript", "Accessibility"], source: "Direct", experience: "5.2 yrs", color: "purple" },
  { id: "a2", name: "Arjun Rao", initials: "AR", role: "Senior Frontend Engineer", score: 84, stage: "RESUME_SCREENING" as Stage, skills: ["React", "Node.js", "PostgreSQL"], source: "Referral", experience: "4.1 yrs", color: "blue" },
  { id: "a3", name: "Fatima Khan", initials: "FK", role: "Senior Frontend Engineer", score: 78, stage: "APPLIED" as Stage, skills: ["JavaScript", "Figma", "CSS"], source: "Job board", experience: "3.4 yrs", color: "orange" },
  { id: "a4", name: "Ethan Cole", initials: "EC", role: "Senior Frontend Engineer", score: 88, stage: "TECHNICAL_INTERVIEW" as Stage, skills: ["React", "GraphQL", "Testing"], source: "Careers page", experience: "6.0 yrs", color: "teal" },
  { id: "a5", name: "Sofia Martin", initials: "SM", role: "Senior Frontend Engineer", score: 94, stage: "OFFER" as Stage, skills: ["React", "TypeScript", "Leadership"], source: "Referral", experience: "7.2 yrs", color: "rose" },
];

export const notifications = [
  { type: "AI_ANALYSIS_READY", title: "AI analysis ready", body: "Maya Patel has a 91% match for Senior Frontend Engineer.", when: "2m" },
  { type: "INTERVIEW_SCHEDULED", title: "Interview confirmed", body: "Ethan Cole's technical interview is scheduled for tomorrow at 10:30.", when: "24m" },
  { type: "OFFER_ACCEPTED", title: "Offer accepted", body: "Sofia Martin accepted the offer for Senior Frontend Engineer.", when: "1h" },
];

export const roleMeta: Record<Role, { label: string; short: string; color: string }> = {
  RECRUITER: { label: "Recruiter", short: "Recruiter workspace", color: "violet" },
  CANDIDATE: { label: "Candidate", short: "Candidate portal", color: "cyan" },
  HIRING_MANAGER: { label: "Hiring Manager", short: "Decision workspace", color: "amber" },
  INTERVIEWER: { label: "Interviewer", short: "Interview workspace", color: "pink" },
  ADMIN: { label: "Admin", short: "Platform control", color: "green" },
};

export const allowedStageTransition = (from: Stage, to: Stage) => {
  if (to === "REJECTED") return !["HIRED", "REJECTED"].includes(from);
  const ordered = stages.map((stage) => stage.key);
  return ordered.indexOf(to) === ordered.indexOf(from) + 1;
};
