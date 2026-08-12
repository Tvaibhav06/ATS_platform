import fs from 'fs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import prisma from './lib/db.js';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_123';

async function runTests() {
  console.log('--- Phase 4 Application API Tests ---');
  
  // 1. Get test users
  const candidate = await prisma.user.findUnique({ where: { email: 'candidate@demo.ats' } });
  const recruiter = await prisma.user.findUnique({ where: { email: 'recruiter@demo.ats' } });
  
  if (!candidate || !recruiter) {
    console.error('Test users not found in DB!');
    return;
  }

  // 2. Generate tokens
  const candidateToken = jwt.sign({ userId: candidate.id, role: 'CANDIDATE', email: candidate.email }, JWT_SECRET, { expiresIn: '1h' });
  const recruiterToken = jwt.sign({ userId: recruiter.id, role: 'RECRUITER', email: recruiter.email }, JWT_SECRET, { expiresIn: '1h' });

  // 3. Create a Job
  let job = await prisma.job.findFirst();
  if (!job) {
    job = await prisma.job.create({
      data: {
        title: 'Senior Software Engineer',
        department: 'Engineering',
        description: 'Looking for a senior full-stack engineer.',
        skillsRequired: '["React", "Node.js", "TypeScript"]',
        skillsPreferred: '["AWS", "PostgreSQL"]',
        experienceRequired: 5,
        employmentType: 'FULL_TIME',
        workMode: 'REMOTE',
        status: 'OPEN',
        companyId: recruiter.companyId || '',
        recruiterId: recruiter.id
      }
    });
  } else {
    await prisma.job.update({ where: { id: job.id }, data: { recruiterId: recruiter.id, status: 'OPEN' } });
  }

  // 4. Create a Candidate Resume & Analysis
  let profile = await prisma.candidateProfile.findUnique({ where: { userId: candidate.id } });
  if (!profile) {
    profile = await prisma.candidateProfile.create({ data: { userId: candidate.id } });
  }

  let resume = await prisma.resume.findFirst({ where: { candidateProfileId: profile.id } });
  if (!resume) {
    resume = await prisma.resume.create({
      data: {
        candidateProfileId: profile.id,
        fileUrl: '/storage/resumes/mock.pdf',
        fileHash: 'mockhash123',
        fileName: 'mock.pdf',
        fileSizeBytes: 1024,
        fileType: 'application/pdf',
        status: 'PARSED'
      }
    });
    
    await prisma.resumeAnalysis.create({
      data: {
        resumeId: resume.id,
        skills: '["React", "Node.js", "TypeScript", "AWS", "Python"]',
        experience: '["Software Engineer at TechCorp 2020-2023"]',
        totalExperienceYears: 6,
      }
    });
  }

  // Delete any existing application for this candidate/job to start fresh
  await prisma.application.deleteMany({
    where: { candidateId: candidate.id, jobId: job.id }
  });

  const apiUrl = 'http://localhost:3001/api/v1/applications';
  
  // TEST 1: Candidate Applies
  console.log('\n[TEST 1] Applying for Job:', job.id);
  let res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${candidateToken}`
    },
    body: JSON.stringify({ jobId: job.id })
  });
  let data = await res.json();
  console.log('Apply Result:', data.success ? 'SUCCESS' : 'FAILED', data.error || '');
  if (data.data?.matchAnalysis) {
    console.log('AI Match Status:', data.data.matchAnalysis.status);
    console.log('Score:', data.data.matchAnalysis.matchScore);
    console.log('Recommendation:', data.data.matchAnalysis.recommendation);
  }
  
  const applicationId = data.data?.id;

  // TEST 2: Duplicate Application
  console.log('\n[TEST 2] Duplicate Application');
  res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${candidateToken}`
    },
    body: JSON.stringify({ jobId: job.id })
  });
  data = await res.json();
  console.log('Duplicate Result:', data.success ? 'SUCCESS (Bug)' : 'FAILED (Expected)', data.error || '');

  if (!applicationId) return;

  // TEST 3: Recruiter Fetches Application
  console.log('\n[TEST 3] Recruiter Fetches Job Applications');
  res = await fetch(`http://localhost:3001/api/v1/jobs/${job.id}/applications`, {
    headers: {
      'Authorization': `Bearer ${recruiterToken}`
    }
  });
  data = await res.json();
  console.log('Applications fetched:', data.data?.length || 0);

  // TEST 4: Recruiter changes stage
  console.log('\n[TEST 4] Recruiter Changes Kanban Stage to RESUME_SCREENING');
  res = await fetch(`http://localhost:3001/api/v1/applications/${applicationId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${recruiterToken}`
    },
    body: JSON.stringify({ stage: 'RESUME_SCREENING' })
  });
  data = await res.json();
  console.log('Stage Update Result:', data.success ? 'SUCCESS' : 'FAILED', data.data?.stage || data.error);

  console.log('\nTests Completed.');
  process.exit(0);
}

runTests().catch(console.error);
