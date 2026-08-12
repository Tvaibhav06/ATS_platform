import { z } from 'zod'

export const jobSchema = z.object({
  title: z.string().min(2),
  department: z.string().optional(),
  location: z.string().optional(),
  salaryMin: z.number().int().optional(),
  salaryMax: z.number().int().optional(),
  experienceRequired: z.number().int().optional(),
  skillsRequired: z.array(z.string()).min(1),
  skillsPreferred: z.array(z.string()).optional().default([]),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
  workMode: z.enum(['REMOTE', 'HYBRID', 'ONSITE']),
  deadline: z.string().datetime().optional(), // ISO string
  description: z.string().min(10),
  status: z.enum(['DRAFT', 'OPEN', 'CLOSED']).optional().default('DRAFT'),
})

export const updateJobSchema = jobSchema.partial()
