import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: false, error: { message: 'Invalid credentials' } }, { status: 401 })
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ success: false, error: { message: 'Invalid credentials' } }, { status: 401 })
    }

    const payload = { userId: user.id, role: user.role, email: user.email }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    // Store session in DB
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days

    // Hash the refresh token before storing
    const { hashPassword } = await import('@/lib/auth')
    const refreshTokenHash = await hashPassword(refreshToken)

    const userAgent = req.headers.get('user-agent') || 'Unknown'
    const ipAddress = req.headers.get('x-forwarded-for') || 'Unknown'

    await prisma.userSession.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt,
      },
    })

    const response = NextResponse.json({
      success: true,
      data: {
        accessToken,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { message: 'Validation failed', details: error.errors } }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
