import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import prisma from './lib/db.js';

async function runTests() {
  const candidate = await prisma.user.findUnique({ where: { email: 'candidate@demo.ats' } });
  if (!candidate) {
    console.error('Candidate user not found in DB!');
    return;
  }
  
  const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_123';
  const token = jwt.sign({ userId: candidate.id, role: 'CANDIDATE', email: 'candidate@demo.ats' }, JWT_SECRET, { expiresIn: '1h' });

  const apiUrl = 'http://localhost:3001/api/v1/candidates/resume';
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  // 1. Test missing file
  const noFileRes = await fetch(apiUrl, { method: 'POST', headers });
  console.log('No file:', await noFileRes.json());

  // 2. Test large file (>10MB)
  try {
    const largeFormData = new FormData();
    const largeBlob = new Blob([new ArrayBuffer(11 * 1024 * 1024)], { type: 'application/pdf' });
    largeFormData.append('file', largeBlob, 'large.pdf');
    const largeRes = await fetch(apiUrl, { method: 'POST', headers, body: largeFormData });
    console.log('Large file:', await largeRes.json());
  } catch (e) {
    console.log('Large file upload correctly aborted by server limits:', e.message);
  }

  // 3. Test magic byte failure (fake PDF)
  const fakeFormData = new FormData();
  const fakeBlob = new Blob(['Not a real PDF'], { type: 'application/pdf' });
  fakeFormData.append('file', fakeBlob, 'fake.pdf');
  const fakeRes = await fetch(apiUrl, { method: 'POST', headers, body: fakeFormData });
  console.log('Fake PDF:', await fakeRes.json());

  // 4. Create a valid mock PDF and test success
  const validPdfBytes = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xbd, 0xbd, 0xbd, 0xbd]); 
  const validFormData = new FormData();
  const validBlob = new Blob([validPdfBytes], { type: 'application/pdf' });
  validFormData.append('file', validBlob, 'real.pdf');
  
  const successRes = await fetch(apiUrl, { method: 'POST', headers, body: validFormData });
  const successData = await successRes.json();
  console.log('Success PDF upload:', successData);

  // 5. Test duplicate upload
  const duplicateRes = await fetch(apiUrl, { method: 'POST', headers, body: validFormData });
  console.log('Duplicate PDF:', await duplicateRes.json());

  await new Promise(r => setTimeout(r, 2000));
}

runTests().catch(console.error);
