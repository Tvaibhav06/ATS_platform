export type ResumeFacts = { skills: string[]; totalExperienceYears: number; name: string };
export type JobFacts = { requiredSkills: string[]; preferredSkills: string[]; experienceRequired: number; title: string };

/** A local, explainable fallback used until an AI provider is configured. */
export function matchCandidate(resume: ResumeFacts, job: JobFacts) {
  const resumeSkills = new Set(resume.skills.map((skill) => skill.toLowerCase()));
  const matchedSkills = job.requiredSkills.filter((skill) => resumeSkills.has(skill.toLowerCase()));
  const missingSkills = job.requiredSkills.filter((skill) => !resumeSkills.has(skill.toLowerCase()));
  const preferredMatches = job.preferredSkills.filter((skill) => resumeSkills.has(skill.toLowerCase()));
  const skillScore = job.requiredSkills.length ? matchedSkills.length / job.requiredSkills.length : 1;
  const experienceScore = Math.min(resume.totalExperienceYears / Math.max(job.experienceRequired, 1), 1);
  const matchScore = Math.round((skillScore * 0.7 + experienceScore * 0.25 + Math.min(preferredMatches.length * 0.025, 0.05)) * 100);
  return {
    matchScore,
    strengths: [...matchedSkills, ...preferredMatches].slice(0, 4),
    matchedSkills,
    missingSkills,
    weakAreas: missingSkills.length ? [`Build evidence for ${missingSkills[0]}`] : ["No material gaps found in required skills"],
    experienceAlignment: `${resume.totalExperienceYears} years of experience compared with ${job.experienceRequired}+ required`,
    recommendation: matchScore >= 80 ? "Strong fit — move to a technical interview" : "Promising profile — review with the hiring team",
    promptVersion: "deterministic-v1",
  };
}
