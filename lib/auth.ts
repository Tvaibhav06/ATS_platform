import bcrypt from 'bcrypt'
// JWT logic moved to jwt.ts to avoid Edge runtime conflicts with bcrypt

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export * from './jwt'
import { getSessionUser } from './jwt'
export const verifyAuth = getSessionUser
