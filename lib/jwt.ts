import * as jose from 'jose'
import { NextRequest } from 'next/server'

// Use environment variables in production, fallback for local dev
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_123'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_456'

const accessSecret = new TextEncoder().encode(JWT_ACCESS_SECRET)
const refreshSecret = new TextEncoder().encode(JWT_REFRESH_SECRET)

export async function generateAccessToken(payload: any): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(accessSecret)
}

export async function generateRefreshToken(payload: any): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(refreshSecret)
}

export async function verifyAccessToken(token: string): Promise<any> {
  try {
    const { payload } = await jose.jwtVerify(token, accessSecret)
    return payload
  } catch (error) {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<any> {
  try {
    const { payload } = await jose.jwtVerify(token, refreshSecret)
    return payload
  } catch (error) {
    return null
  }
}

// Utility to get session data from standard Authorization header
export async function getSessionUser(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.substring(7)
  return verifyAccessToken(token)
}
