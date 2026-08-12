import 'dotenv/config';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import prisma from './lib/db.js';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_123';

async function runTests() {
  console.log('--- Phase 4 Final Verification Tests ---');

  if (!process.env.GEMINI_API_KEY) {
    console.warn('\n[WARNING] No GEMINI_API_KEY found in environment. The successful AI match test will fail. Please add it to your .env file.\n');
  }

  // 1. Get test users
  const candidateA = await prisma.user.findUnique({ where: { email: 'candidate@demo.ats' } });
  
  // Create Candidate B if they don't exist
  let candidateB = await prisma.user.findUnique({ where: { email: 'candidateB@demo.ats' } });
  if (!candidateB) {
    candidateB = await prisma.user.create({
      data: {
        email: 'candidateB@demo.ats',
        name: 'Candidate B',
        role: 'CANDIDATE'
      }
    });
  }

  const recruiter = await prisma.user.findUnique({ where: { email: 'recruiter@demo.ats' } });
  const hm = await prisma.user.findUnique({ where: { email: 'hm@demo.ats' } });
  
  if (!candidateA || !recruiter || !hm) {
    console.error('Core test users not found in DB!');
    return;
  }

  // 2. Generate tokens
  const tokenA = jwt.sign({ userId: candidateA.id, role: 'CANDIDATE', email: candidateA.email }, JWT_SECRET, { expiresIn: '1h' });
  const tokenB = jwt.sign({ userId: candidateB.id, role: 'CANDIDATE', email: candidateB.email }, JWT_SECRET, { expiresIn: '1h' });
  const recruiterToken = jwt.sign({ userId: recruiter.id, role: 'RECRUITER', email: recruiter.email }, JWT_SECRET, { expiresIn: '1h' });
  const hmToken = jwt.sign({ userId: hm.id, role: 'HIRING_MANAGER', email: hm.email }, JWT_SECRET, { expiresIn: '1h' });

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
    await prisma.job.update({ where: { id: job.id }, data: { recruiterId: recruiter.id, status: 'OPEN', companyId: hm.companyId } });
  }
  await prisma.assessmentAttempt.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany({
    where: { jobId: job.id }
  });

  const apiUrl = 'http://localhost:3001/api/v1/applications';
  
  // Temporarily unset key to simulate failure
  const originalKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'invalid_key';

  // --- TEST 1 & 2: Apply and AI Match Status ---
  console.log('\n[TEST 1] Candidate A Applies for Job (Simulating AI Failure)');
  let res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
    body: JSON.stringify({ jobId: job.id })
  });
  let data = await res.json();
  const applicationAId = data.data?.id;

  console.log('Apply Result:', data.success ? 'SUCCESS' : 'FAILED', data.error || '');
  if (data.data?.matchAnalysis) {
    console.log('AI Match Status:', data.data.matchAnalysis.status);
  }

  // Restore key
  process.env.GEMINI_API_KEY = originalKey;

  // --- TEST 3: Retry Flow ---
  console.log('\n[TEST 3] Retrying AI Match (with valid key)...');
  res = await fetch(`http://localhost:3001/api/v1/applications/${applicationAId}/retry-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${recruiterToken}` }
  });
  data = await res.json();
  console.log('Retry AI Match Status:', data.data?.status);
  console.log('Score:', data.data?.matchScore);
  console.log('Recommendation:', data.data?.recommendation);

  // --- TEST 4: Hiring Manager Read Access ---
  console.log('\n[TEST 4] Hiring Manager Read Access');
  res = await fetch(`http://localhost:3001/api/v1/jobs/${job.id}/applications`, {
    headers: { 'Authorization': `Bearer ${hmToken}` }
  });
  data = await res.json();
  console.log('HM Fetch Success?', data.success);
  console.log('Applications fetched by HM:', data.data?.length || 0);

  // --- TEST 5: Candidate Resource Isolation ---
  console.log('\n[TEST 5] Candidate B attempts to access Candidate A\'s Application');
  res = await fetch(`http://localhost:3001/api/v1/applications/${applicationAId}`, {
    headers: { 'Authorization': `Bearer ${tokenB}` }
  });
  data = await res.json();
  console.log('Access allowed?', data.success);
  console.log('Expected Error Status (should be 403):', res.status);
  console.log('Error Message:', data.error?.message);

  console.log('\nTests Completed.');
  process.exit(0);
}

runTests().catch(console.error);
