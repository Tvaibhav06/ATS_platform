import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const user = getSessionUser(req as any)
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthenticated' } }, { status: 401 })
    }

    const sessions = await prisma.userSession.findMany({
      where: {
        userId: user.userId,
        revokedAt: null,
        expiresAt: { gt: new Date() }
      },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { lastUsedAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: sessions })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
