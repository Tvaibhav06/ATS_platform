import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = getSessionUser(req as any)
    if (!user) {
      return NextResponse.json({ success: false, error: { message: 'Unauthenticated' } }, { status: 401 })
    }

    const { id } = await params

    if (id === 'all') {
      // Revoke all other sessions for this user (not strictly 'all', but usually 'all other')
      // For simplicity, revoke all sessions since we don't have current session ID in JWT payload
      await prisma.userSession.updateMany({
        where: { userId: user.userId, revokedAt: null },
        data: { revokedAt: new Date() }
      })
      return NextResponse.json({ success: true, message: 'All sessions revoked' })
    }

    const session = await prisma.userSession.findUnique({ where: { id } })
    if (!session || session.userId !== user.userId) {
      return NextResponse.json({ success: false, error: { message: 'Session not found or unauthorized' } }, { status: 404 })
    }

    await prisma.userSession.update({
      where: { id },
      data: { revokedAt: new Date() }
    })

    return NextResponse.json({ success: true, message: 'Session revoked' })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
