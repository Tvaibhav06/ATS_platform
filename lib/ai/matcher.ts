import { GoogleGenAI, Type } from '@google/genai';
import { aiMatchAnalysisSchema, AiMatchAnalysis } from '@/lib/schemas/match';
import prisma from '@/lib/db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MATCH_SYSTEM_PROMPT = `You are an expert technical recruiter and AI matching assistant. 
Your task is to analyze a candidate's resume data against a job description and requirements.
You must return a structured JSON evaluation following the exact schema provided.
Do NOT hallucinate skills or experience. Be strict and objective.
Your recommendation is strictly advisory (GOOD_FIT, POTENTIAL_FIT, or WEAK_FIT).`;

export async function generateMatchAnalysis(
  applicationId: string, 
  jobId: string, 
  resumeId: string,
  retries = 1
): Promise<boolean> {
  try {
    // 1. Fetch Job Requirements
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });
    if (!job) throw new Error('Job not found');

    // 2. Fetch Candidate Resume Analysis
    const resumeAnalysis = await prisma.resumeAnalysis.findUnique({
      where: { resumeId: resumeId }
    });
    if (!resumeAnalysis) throw new Error('Resume analysis not found');

    // 3. Prepare Prompt Content
    const promptContent = `
--- JOB REQUIREMENTS ---
Title: ${job.title}
Department: ${job.department || 'N/A'}
Experience Required: ${job.experienceRequired} years
Required Skills: ${job.skillsRequired}
Preferred Skills: ${job.skillsPreferred}
Description: ${job.description}

--- CANDIDATE RESUME ---
Skills: ${resumeAnalysis.skills || 'None extracted'}
Experience: ${resumeAnalysis.experience || 'None extracted'}
Education: ${resumeAnalysis.education || 'None extracted'}
Projects: ${resumeAnalysis.projects || 'None extracted'}
Certifications: ${resumeAnalysis.certifications || 'None extracted'}
Total Experience Years: ${resumeAnalysis.totalExperienceYears || 0}
`;

    // 4. Call Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: promptContent,
      config: {
        systemInstruction: MATCH_SYSTEM_PROMPT,
        temperature: 0.2, // Low temperature for more objective analysis
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            match_score: { type: Type.INTEGER, description: 'A score from 0 to 100' },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            matched_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missing_skills: { type: Type.ARRAY, items: { type: Type.STRING } },
            weak_areas: { type: Type.ARRAY, items: { type: Type.STRING } },
            experience_alignment: { type: Type.STRING },
            recommendation: { 
              type: Type.STRING, 
              enum: ['GOOD_FIT', 'POTENTIAL_FIT', 'WEAK_FIT'] 
            },
          },
          required: [
            'match_score', 
            'strengths', 
            'matched_skills', 
            'missing_skills', 
            'weak_areas', 
            'experience_alignment', 
            'recommendation'
          ]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error('Empty response from AI');

    const parsedAiData = JSON.parse(responseText);

    // 5. Zod Validation
    const validatedData = aiMatchAnalysisSchema.parse(parsedAiData);

    // 6. Update Database
    await prisma.matchAnalysis.update({
      where: { applicationId },
      data: {
        matchScore: validatedData.match_score,
        strengths: JSON.stringify(validatedData.strengths),
        matchedSkills: JSON.stringify(validatedData.matched_skills),
        missingSkills: JSON.stringify(validatedData.missing_skills),
        weakAreas: JSON.stringify(validatedData.weak_areas),
        experienceAlignment: validatedData.experience_alignment,
        recommendation: validatedData.recommendation,
        status: 'COMPLETED',
        promptVersion: 'MATCH_PROMPT_V1',
        provider: 'google',
        model: 'gemini-2.5-flash'
      }
    });

    return true;

  } catch (error) {
    console.error(`Match Analysis failed for application ${applicationId}:`, error);
    
    if (retries > 0) {
      console.log(`Retrying match analysis... (${retries} attempts left)`);
      return generateMatchAnalysis(applicationId, jobId, resumeId, retries - 1);
    }
    
    // Mark as FAILED if out of retries
    try {
      await prisma.matchAnalysis.update({
        where: { applicationId },
        data: { status: 'FAILED' }
      });
    } catch (dbError) {
      console.error('Failed to update MatchAnalysis status to FAILED', dbError);
    }
    
    return false;
  }
}
