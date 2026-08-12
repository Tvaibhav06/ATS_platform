import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_PROMPT = `
You are an expert ATS (Applicant Tracking System) resume parser. 
Extract the following information from the provided resume text and return it EXACTLY as a JSON object matching this schema:

{
  "extractedName": "string or null",
  "extractedEmail": "string or null",
  "extractedPhone": "string or null",
  "skills": ["string", ...],
  "education": ["string", ...],
  "experience": ["string", ...],
  "projects": ["string", ...],
  "certifications": ["string", ...],
  "languages": ["string", ...],
  "totalExperienceYears": number or null
}

Rules:
1. Do not include any markdown formatting (e.g., \`\`\`json). Just return the raw JSON object.
2. If a field is not found in the resume, return null (for strings/numbers) or an empty array [] (for arrays).
3. Try to calculate totalExperienceYears accurately based on the dates provided in the experience section.
4. Extract all technical and soft skills into the skills array.
`;

export async function extractStructuredResumeData(resumeText: string) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Returning mock AI extraction.');
    // Mock extraction to prevent blocking development if key is missing
    return {
      extractedName: 'Candidate Name',
      extractedEmail: 'candidate@example.com',
      extractedPhone: '555-0100',
      skills: ['JavaScript', 'React', 'Node.js'],
      education: ['B.S. Computer Science'],
      experience: ['Software Engineer at TechCorp (2020-2023)'],
      projects: [],
      certifications: [],
      languages: ['English'],
      totalExperienceYears: 3
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\nResume Text:\n' + resumeText }] }
      ],
      config: {
        responseMimeType: 'application/json',
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('AI returned empty response');
    }

    // Attempt to parse the returned JSON
    const parsedData = JSON.parse(responseText);
    return parsedData;
  } catch (error) {
    console.error('AI Extraction failed:', error);
    throw new Error('Failed to extract structured data from resume');
  }
}
