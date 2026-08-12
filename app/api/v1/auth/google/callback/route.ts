import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { generateAccessToken, generateRefreshToken } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 })
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/v1/auth/google/callback`

    // 1. Exchange code for Google tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokenData = await tokenRes.json()
    if (!tokenRes.ok) {
      console.error('Google token error:', tokenData)
      return NextResponse.json({ error: 'Failed to exchange token' }, { status: 400 })
    }

    // 2. Fetch user profile from Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    
    const userData = await userRes.json()
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 400 })
    }

    // 3. Upsert user in our database (Native session replacement)
    let user = await prisma.user.findUnique({ where: { email: userData.email } })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          avatarUrl: userData.picture,
          emailVerifiedAt: new Date(), // Google emails are verified
          role: 'CANDIDATE', // Default role for OAuth signups
        }
      })
      // Provision candidate profile
      await prisma.candidateProfile.create({
        data: { userId: user.id }
      })
    } else if (!user.avatarUrl) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: userData.picture }
      })
    }

    // 4. Issue custom JWTs and register UserSession
    const payload = { userId: user.id, role: user.role, email: user.email }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    const { hashPassword } = await import('@/lib/auth')
    const refreshTokenHash = await hashPassword(refreshToken)

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

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

    // 5. Set HTTP-only cookie and redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', req.url))
    
    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })
    
    // We could pass access_token via URL hash or an HttpOnly cookie.
    // Standard practice for SPA is passing it via a secure redirect mechanism or returning JSON
    // Since this is a direct browser callback, we set the access token as a cookie temporarily or redirect to a client page that grabs it.
    response.cookies.set('accessToken', accessToken, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    })

    return response

  } catch (error) {
    console.error('OAuth Callback Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
