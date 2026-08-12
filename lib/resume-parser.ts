import crypto from 'crypto'
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Validates the magic bytes of a file buffer to ensure it's a PDF or DOCX.
 */
export function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;

  const hex = buffer.subarray(0, 4).toString('hex').toUpperCase();
  
  if (mimeType === 'application/pdf') {
    // PDF magic number: %PDF (25 50 44 46)
    return hex.startsWith('25504446');
  } 
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // DOCX (ZIP) magic number: PK.. (50 4B 03 04)
    return hex === '504B0304';
  }

  return false;
}

/**
 * Calculates SHA-256 hash of a buffer for duplicate detection.
 */
export function calculateFileHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Extracts text from the uploaded resume.
 * Supports PDF and DOCX.
 */
export async function extractTextFromResume(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === 'application/pdf') {
    try {
      const data = await pdfParse(buffer);
      return data.text;
    } catch (error) {
      console.error('PDF parsing error:', error);
      throw new Error('Failed to parse PDF document');
    }
  } 
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error('DOCX parsing error:', error);
      throw new Error('Failed to parse DOCX document');
    }
  }

  throw new Error('Unsupported file format for text extraction');
}
