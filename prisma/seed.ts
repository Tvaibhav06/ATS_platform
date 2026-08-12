import prisma from '../lib/db'
import bcrypt from 'bcrypt'

async function main() {
  console.log('Starting seed...')
  
  const passwordHash = await bcrypt.hash('Demo@1234', 10)

  const company = await prisma.company.create({
    data: {
      name: 'Demo ATS Corp',
      industry: 'Technology',
      companySize: '100-500',
    }
  })

  const users = [
    { email: 'admin@demo.ats', role: 'ADMIN', name: 'Admin User' },
    { email: 'recruiter@demo.ats', role: 'RECRUITER', name: 'Recruiter User' },
    { email: 'hm@demo.ats', role: 'HIRING_MANAGER', name: 'Hiring Manager User' },
    { email: 'interviewer@demo.ats', role: 'INTERVIEWER', name: 'Interviewer User' },
    { email: 'candidate@demo.ats', role: 'CANDIDATE', name: 'Candidate User' },
  ]

  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        passwordHash,
        name: u.name,
        role: u.role,
        companyId: u.role !== 'CANDIDATE' ? company.id : null,
        emailVerifiedAt: new Date(),
      },
    })
    
    if (u.role === 'CANDIDATE') {
      await prisma.candidateProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
        }
      })
    }
  }

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
