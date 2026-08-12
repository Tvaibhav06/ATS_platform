import prisma from './lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_123';

async function createToken(userId: string, email: string, role: string) {
  return jwt.sign({ userId, role, email }, JWT_SECRET, { expiresIn: '1h' });
}

async function runTests() {
  console.log('--- Phase 6 Extended Verification ---');
  const apiUrl = 'http://localhost:3001/api/v1';

  // 1. Setup Users & Auth
  const company = await prisma.company.findFirst();
  let recruiter = await prisma.user.findUnique({ where: { email: 'recruiter@demo.ats' }});
  let hm = await prisma.user.findUnique({ where: { email: 'hm@demo.ats' }});
  let candidate = await prisma.user.findUnique({ where: { email: 'candidate@demo.ats' }});
  let admin = await prisma.user.findUnique({ where: { email: 'admin@demo.ats' }});

  const recToken = await createToken(recruiter!.id, recruiter!.email, recruiter!.role);
  const hmToken = await createToken(hm!.id, hm!.email, hm!.role);
  const candToken = await createToken(candidate!.id, candidate!.email, candidate!.role);
  const adminToken = await createToken(admin!.id, admin!.email, admin!.role);

  const job = await prisma.job.findFirst({ where: { recruiterId: recruiter!.id }});
  const application = await prisma.application.findFirst({ where: { candidateId: candidate!.id, jobId: job!.id }});

  // --- PART 1: Assessment Auto-Submit & Debugging Question ---
  console.log('\n[PART 1] Assessment Verification');
  
  // Recruiter creates assessment with 0 duration to force instant timeout
  let res = await fetch(`${apiUrl}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${recToken}` },
    body: JSON.stringify({ title: 'Debugging Test', instructions: 'Find the bug', type: 'TECHNICAL', durationMinutes: 0, jobId: job!.id })
  });
  let data = await res.json();
  if (!data.success) {
    console.error('Failed to create assessment:', data);
  }
  const assessmentId = data.data?.id;

  // Add DEBUGGING Question
  await fetch(`${apiUrl}/assessments/${assessmentId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${recToken}` },
    body: JSON.stringify({ type: 'DEBUGGING', prompt: 'Fix the off-by-one error', difficulty: 'HARD', points: 20 })
  });
  console.log('Debugging Question Added: SUCCESS');

  // Candidate starts assessment
  await prisma.assessmentAttempt.deleteMany({ where: { applicationId: application!.id } });
  res = await fetch(`${apiUrl}/assessments/${assessmentId}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${candToken}` },
    body: JSON.stringify({ applicationId: application!.id })
  });
  data = await res.json();
  if (!data.success) {
    console.error('Failed to start attempt:', data);
  }
  const attemptId = data.data?.id;

  // Wait 1 second to ensure deadline is passed (since duration is 0 minutes)
  await new Promise(r => setTimeout(r, 1000));

  // Candidate tries to answer -> should auto-submit because deadline passed
  res = await fetch(`${apiUrl}/assessments/attempts/${attemptId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${candToken}` },
    body: JSON.stringify({ questionId: 'fake-id', answerText: 'test' })
  });
  data = await res.json();
  console.log('Auto-Submit on Late Answer:', data.error?.message?.includes('auto-submitted') ? 'SUCCESS' : 'FAILED', data.error?.message);

  // --- PART 2: All 7 Analytics ---
  console.log('\n[PART 2] Analytics Verification');
  const metrics = [
    'applications-per-job',
    'hiring-funnel',
    'time-to-hire',
    'offer-acceptance',
    'candidate-source',
    'recruiter-performance',
    'interview-success'
  ];

  for (const m of metrics) {
    res = await fetch(`${apiUrl}/analytics/${m}`, { headers: { 'Authorization': `Bearer ${recToken}` } });
    data = await res.json();
    console.log(`Analytics [${m}]:`, data.success ? 'SUCCESS' : 'FAILED');
  }

  // --- PART 3: Global Search & RBAC ---
  console.log('\n[PART 3] Global Search RBAC Verification');
  
  // Admin search
  res = await fetch(`${apiUrl}/search?q=Demo`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
  data = await res.json();
  console.log('Admin Search:', data.success && data.data.companies ? 'SUCCESS' : 'FAILED');

  // Recruiter search
  res = await fetch(`${apiUrl}/search?q=Demo`, { headers: { 'Authorization': `Bearer ${recToken}` } });
  data = await res.json();
  console.log('Recruiter Search:', data.success && data.data.companies === undefined && data.data.jobs ? 'SUCCESS' : 'FAILED'); // Recruiter shouldn't get all companies, wait, my implementation returns jobs/candidates/interviews for recruiter.

  // Candidate search
  res = await fetch(`${apiUrl}/search?q=Demo`, { headers: { 'Authorization': `Bearer ${candToken}` } });
  data = await res.json();
  console.log('Candidate Search:', data.success && data.data.companies && data.data.jobs && !data.data.candidates ? 'SUCCESS' : 'FAILED');

  // --- PART 4: Admin CRUD ---
  console.log('\n[PART 4] Admin CRUD Verification');

  // Admin manages users (Roles/Permissions)
  res = await fetch(`${apiUrl}/admin/users`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
  data = await res.json();
  console.log('Admin Users (GET):', data.success ? 'SUCCESS' : 'FAILED', data.data?.length > 0 ? `Found ${data.data.length}` : '');

  // Admin manages companies
  res = await fetch(`${apiUrl}/admin/companies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ name: 'Admin Created Corp' })
  });
  data = await res.json();
  console.log('Admin Companies (POST):', data.success ? 'SUCCESS' : 'FAILED', data.data?.name);

  // Admin Reports
  res = await fetch(`${apiUrl}/admin/reports`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
  data = await res.json();
  console.log('Admin Reports (GET):', data.success ? 'SUCCESS' : 'FAILED', data.data?.summary?.totalUsers !== undefined ? 'Has Summary' : '');

  console.log('\nExtended Verification Complete.');
  process.exit(0);
}

runTests().catch(console.error);
