import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import jwt from 'jsonwebtoken'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_123'

const requestSchema = z.object({
  email: z.string().email(),
})

const resetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
})

// POST: Request password reset link (OTP/Token)
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = requestSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Don't leak user existence
      return NextResponse.json({ success: true, message: 'If the email is registered, a reset link was sent.' })
    }

    // Token valid for 15 minutes
    const token = jwt.sign({ userId: user.id, action: 'RESET_PASSWORD' }, JWT_SECRET, { expiresIn: '15m' })
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    // TODO: Send email with resetLink
    console.log(`[Mock Email] To: ${email} -> Password Reset Link: ${resetLink}`)

    return NextResponse.json({ success: true, message: 'Password reset link sent.' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { message: 'Validation failed', details: error.errors } }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}

// PUT: Set new password
export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { token, newPassword } = resetSchema.parse(body)

    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.action !== 'RESET_PASSWORD' || !decoded.userId) {
      return NextResponse.json({ success: false, error: { message: 'Invalid token' } }, { status: 400 })
    }

    const passwordHash = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash }
    })
    
    // Optional: Revoke all existing sessions so user has to log in again
    await prisma.userSession.updateMany({
      where: { userId: decoded.userId, revokedAt: null },
      data: { revokedAt: new Date() }
    })

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { message: 'Validation failed', details: error.errors } }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: { message: 'Invalid or expired token' } }, { status: 400 })
  }
}
