import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret_123'

const requestSchema = z.object({
  email: z.string().email(),
})

// POST: Request email verification link
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = requestSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Don't leak whether user exists
      return NextResponse.json({ success: true, message: 'If registered, a verification link has been sent.' })
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ success: false, error: { message: 'Email already verified' } }, { status: 400 })
    }

    const token = jwt.sign({ userId: user.id, action: 'VERIFY_EMAIL' }, JWT_SECRET, { expiresIn: '1h' })
    const verificationLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

    // TODO: Send email with verificationLink
    console.log(`[Mock Email] To: ${email} -> Verification Link: ${verificationLink}`)

    return NextResponse.json({ success: true, message: 'Verification link sent' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { message: 'Validation failed', details: error.errors } }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}

// PUT: Verify the email using the token
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ success: false, error: { message: 'Token is required' } }, { status: 400 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.action !== 'VERIFY_EMAIL' || !decoded.userId) {
      return NextResponse.json({ success: false, error: { message: 'Invalid token' } }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { emailVerifiedAt: new Date() }
    })

    return NextResponse.json({ success: true, message: 'Email verified successfully' })
  } catch (error) {
    return NextResponse.json({ success: false, error: { message: 'Invalid or expired token' } }, { status: 400 })
  }
}
