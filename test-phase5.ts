import prisma from './lib/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_123';

async function createToken(userId: string, email: string, role: string) {
  return jwt.sign({ userId, role, email }, JWT_SECRET, { expiresIn: '1h' });
}

async function runTests() {
  console.log('--- Phase 5 Integration Tests ---');
  
  // 1. Setup Users
  const company = await prisma.company.findFirst();
  if (!company) throw new Error("No company found. Did you seed?");

  let recruiter = await prisma.user.findUnique({ where: { email: 'recruiter@demo.ats' }});
  let hm = await prisma.user.findUnique({ where: { email: 'hm@demo.ats' }});
  let candidate = await prisma.user.findUnique({ where: { email: 'candidate@demo.ats' }});
  let interviewer = await prisma.user.findUnique({ where: { email: 'interviewer@demo.ats' }});

  if (!interviewer) {
    interviewer = await prisma.user.create({
      data: {
        email: 'interviewer@demo.ats',
        name: 'Isaac Interviewer',
        role: 'INTERVIEWER',
        companyId: company.id
      }
    });
  }

  // Ensure hm is part of company
  if (hm?.companyId !== company.id) {
    hm = await prisma.user.update({
      where: { id: hm!.id },
      data: { companyId: company.id }
    });
  }


  const recToken = await createToken(recruiter!.id, recruiter!.email, recruiter!.role);
  const hmToken = await createToken(hm!.id, hm!.email, hm!.role);
  const intToken = await createToken(interviewer!.id, interviewer!.email, interviewer!.role);
  const candToken = await createToken(candidate!.id, candidate!.email, candidate!.role);

  // 2. Ensure Application exists
  const job = await prisma.job.findFirst({ where: { recruiterId: recruiter!.id }});
  let application = await prisma.application.findFirst({ where: { candidateId: candidate!.id, jobId: job!.id }});
  if (!application) {
    application = await prisma.application.create({
      data: { candidateId: candidate!.id, jobId: job!.id, stage: 'APPLIED' }
    });
  }

  const apiUrl = 'http://localhost:3001/api/v1';

  // --- TEST 1: Recruiter Schedules Interview ---
  console.log('\n[TEST 1] Recruiter Schedules Interview');
  let res = await fetch(`${apiUrl}/interviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${recToken}` },
    body: JSON.stringify({
      applicationId: application.id,
      interviewerId: interviewer.id,
      type: 'TECHNICAL',
      scheduledAt: new Date(Date.now() + 86400000).toISOString(),
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    })
  });
  let data = await res.json();
  console.log('Schedule Result:', data.success ? 'SUCCESS' : 'FAILED', data.error || '');
  const interviewId = data.data?.id;

  if (!interviewId) {
     console.error('Failed to create interview. Exiting tests.');
     return;
  }

  // --- TEST 2: Interviewer Submits Feedback ---
  console.log('\n[TEST 2] Interviewer Submits Feedback');
  res = await fetch(`${apiUrl}/interviews/${interviewId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${intToken}` },
    body: JSON.stringify({
      technicalScore: 4,
      communicationScore: 5,
      problemSolvingScore: 4,
      teamworkScore: 5,
      leadershipScore: 3,
      overallRating: 4,
      comments: 'Solid technical background. Great communicator.'
    })
  });
  data = await res.json();
  console.log('Feedback Result:', data.success ? 'SUCCESS' : 'FAILED', data.error || '');

  // Check state machine update
  const updatedInterview = await prisma.interview.findUnique({ where: { id: interviewId }});
  console.log('Interview Status Auto-Updated to COMPLETED?', updatedInterview?.status === 'COMPLETED');

  // --- TEST 3: Hiring Manager Compares Feedback ---
  console.log('\n[TEST 3] Hiring Manager Fetches Feedback');
  res = await fetch(`${apiUrl}/interviews/${interviewId}/feedback`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${hmToken}` }
  });
  data = await res.json();
  console.log('HM Fetch Feedbacks Result:', data.success ? 'SUCCESS' : 'FAILED');
  console.log('Feedbacks found:', data.data?.length);

  // --- TEST 4: Recruiter Generates Offer ---
  console.log('\n[TEST 4] Recruiter Generates Offer');
  
  // Cleanup any existing offers to avoid 409
  await prisma.offerLetter.deleteMany({ where: { applicationId: application.id } });

  res = await fetch(`${apiUrl}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${recToken}` },
    body: JSON.stringify({
      applicationId: application.id,
      candidateName: candidate!.name || 'Candidate A',
      role: 'Senior Software Engineer',
      salary: 150000,
      joiningDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      location: 'Remote',
      benefits: 'Health Insurance, 401k matching'
    })
  });
  data = await res.json();
  console.log('Generate Offer Result:', data.success ? 'SUCCESS' : 'FAILED', data.error || '');
  const offerId = data.data?.id;
  console.log('PDF Generated (Base64 length)?', data.data?.pdfUrl?.length > 100);

  // Check App Stage Update
  const postOfferApp = await prisma.application.findUnique({ where: { id: application.id }});
  console.log('App Stage Auto-Updated to OFFER?', postOfferApp?.stage === 'OFFER');

  if (!offerId) {
     console.error('Failed to create offer. Exiting tests.');
     return;
  }

  // --- TEST 5: Candidate Accepts Offer ---
  console.log('\n[TEST 5] Candidate Accepts Offer');
  res = await fetch(`${apiUrl}/offers/${offerId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${candToken}` },
    body: JSON.stringify({ status: 'ACCEPTED' })
  });
  data = await res.json();
  console.log('Accept Offer Result:', data.success ? 'SUCCESS' : 'FAILED', data.error || '');

  // Check App Stage Update
  const postAcceptApp = await prisma.application.findUnique({ where: { id: application.id }});
  console.log('App Stage Auto-Updated to HIRED?', postAcceptApp?.stage === 'HIRED');

  // --- TEST 6: Verify Authorization Blocks ---
  console.log('\n[TEST 6] Authorization & Security Checks');
  
  // 6a. Candidate shouldn't fetch feedback
  res = await fetch(`${apiUrl}/interviews/${interviewId}/feedback`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${candToken}` }
  });
  console.log('Candidate Fetch Feedback Blocked?', res.status === 403);

  // 6b. Interviewer shouldn't generate offer (salary data exposure prevention)
  res = await fetch(`${apiUrl}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${intToken}` },
    body: JSON.stringify({ applicationId: application.id, candidateName: 'x', role: 'x', salary: 1, joiningDate: new Date(), location: 'x' })
  });
  console.log('Interviewer Generate Offer Blocked?', res.status === 403);

  console.log('\nTests Completed.');
  process.exit(0);
}

runTests().catch(console.error);
