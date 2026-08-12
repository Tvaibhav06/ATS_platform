import prisma from './lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_123';

async function createToken(userId: string, email: string, role: string) {
  return jwt.sign({ userId, role, email }, JWT_SECRET, { expiresIn: '1h' });
}

async function runTests() {
  console.log('--- Phase 6 Integration Tests ---');
  
  // 1. Setup Users & Auth
  const company = await prisma.company.findFirst();
  if (!company) throw new Error("No company found. Did you seed?");

  let recruiter = await prisma.user.findUnique({ where: { email: 'recruiter@demo.ats' }});
  let candidate = await prisma.user.findUnique({ where: { email: 'candidate@demo.ats' }});
  let admin = await prisma.user.findUnique({ where: { email: 'admin@demo.ats' }});

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@demo.ats',
        name: 'System Admin',
        role: 'ADMIN'
      }
    });
  }

  const recToken = await createToken(recruiter!.id, recruiter!.email, recruiter!.role);
  const candToken = await createToken(candidate!.id, candidate!.email, candidate!.role);
  const adminToken = await createToken(admin!.id, admin!.email, admin!.role);

  const job = await prisma.job.findFirst({ where: { recruiterId: recruiter!.id }});
  const application = await prisma.application.findFirst({ where: { candidateId: candidate!.id, jobId: job!.id }});

  const apiUrl = 'http://localhost:3001/api/v1';

  // --- TEST 1: Recruiter Creates Assessment ---
  console.log('\n[TEST 1] Recruiter Creates Assessment');
  let res = await fetch(`${apiUrl}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${recToken}` },
    body: JSON.stringify({
      title: 'Full Stack Engineer Assessment',
      instructions: 'Please complete all MCQs and Coding tasks.',
      type: 'TECHNICAL',
      durationMinutes: 60,
      jobId: job!.id
    })
  });
  let data = await res.json();
  console.log('Create Assessment:', data.success ? 'SUCCESS' : 'FAILED', data.error || '');
  const assessmentId = data.data?.id;

  if (!assessmentId) return console.error('Failed to create assessment.');

  // Add MCQ Question
  res = await fetch(`${apiUrl}/assessments/${assessmentId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${recToken}` },
    body: JSON.stringify({
      type: 'MCQ',
      prompt: 'What does CSS stand for?',
      difficulty: 'EASY',
      points: 10,
      options: [
        { text: 'Cascading Style Sheets', isCorrect: true },
        { text: 'Colorful Style Sheets', isCorrect: false }
      ]
    })
  });
  data = await res.json();
  const mcqId = data.data?.id;
  const correctOptionId = data.data?.options.find((o: any) => o.isCorrect)?.id;
  console.log('Add MCQ Question:', data.success ? 'SUCCESS' : 'FAILED');

  // Add CODING Question
  res = await fetch(`${apiUrl}/assessments/${assessmentId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${recToken}` },
    body: JSON.stringify({
      type: 'CODING',
      prompt: 'Write a function to reverse a string.',
      difficulty: 'MEDIUM',
      points: 40
    })
  });
  data = await res.json();
  const codingId = data.data?.id;
  console.log('Add CODING Question:', data.success ? 'SUCCESS' : 'FAILED');


  // --- TEST 2: Candidate Takes Assessment ---
  console.log('\n[TEST 2] Candidate Takes Assessment');
  
  // Cleanup existing attempts
  await prisma.assessmentAttempt.deleteMany({ where: { applicationId: application!.id } });

  res = await fetch(`${apiUrl}/assessments/${assessmentId}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${candToken}` },
    body: JSON.stringify({ applicationId: application!.id })
  });
  data = await res.json();
  console.log('Start Attempt:', data.success ? 'SUCCESS' : 'FAILED', data.error || '');
  const attemptId = data.data?.id;

  // Answer MCQ
  res = await fetch(`${apiUrl}/assessments/attempts/${attemptId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${candToken}` },
    body: JSON.stringify({ questionId: mcqId, answerText: correctOptionId })
  });
  console.log('Answer MCQ:', (await res.json()).success ? 'SUCCESS' : 'FAILED');

  // Answer CODING
  res = await fetch(`${apiUrl}/assessments/attempts/${attemptId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${candToken}` },
    body: JSON.stringify({ questionId: codingId, answerText: 'function rev(s) { return s.split("").reverse().join(""); }', language: 'javascript' })
  });
  console.log('Answer CODING:', (await res.json()).success ? 'SUCCESS' : 'FAILED');

  // Submit Assessment
  res = await fetch(`${apiUrl}/assessments/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${candToken}` }
  });
  data = await res.json();
  console.log('Submit Assessment:', data.success ? 'SUCCESS' : 'FAILED', data.error || '');
  console.log('Final Score:', data.data?.score); // Expected 10 + (40 * 0.8) = 42

  // --- TEST 3: Analytics ---
  console.log('\n[TEST 3] Fetch Analytics');
  res = await fetch(`${apiUrl}/analytics/applications-per-job`, { headers: { 'Authorization': `Bearer ${recToken}` } });
  data = await res.json();
  console.log('Apps Per Job:', data.success ? 'SUCCESS' : 'FAILED', data.data?.length > 0 ? 'Has Data' : 'Empty');

  res = await fetch(`${apiUrl}/analytics/offer-acceptance`, { headers: { 'Authorization': `Bearer ${recToken}` } });
  data = await res.json();
  console.log('Offer Acceptance Rate:', data.success ? 'SUCCESS' : 'FAILED', data.data?.rate !== undefined ? `${data.data.rate}%` : 'No Rate');

  // --- TEST 4: Global Search ---
  console.log('\n[TEST 4] Global Search');
  res = await fetch(`${apiUrl}/search?q=Demo`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
  data = await res.json();
  console.log('Admin Search (Demo):', data.success ? 'SUCCESS' : 'FAILED', data.data ? `Found ${data.data.companies?.length || 0} companies` : '');

  // --- TEST 5: Admin Panel ---
  console.log('\n[TEST 5] Admin Panel Configuration');
  res = await fetch(`${apiUrl}/admin/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({ maxUploadSizeMb: 10 })
  });
  data = await res.json();
  console.log('Patch Settings:', data.success ? 'SUCCESS' : 'FAILED', data.data?.maxUploadSizeMb === 10 ? 'Verified' : 'Mismatch');

  res = await fetch(`${apiUrl}/admin/audit-logs?limit=5`, { headers: { 'Authorization': `Bearer ${adminToken}` } });
  data = await res.json();
  console.log('Fetch Audit Logs:', data.success ? 'SUCCESS' : 'FAILED', `Count: ${data.data?.length || 0}`);

  console.log('\nPhase 6 Tests Completed.');
  process.exit(0);
}

runTests().catch(console.error);
