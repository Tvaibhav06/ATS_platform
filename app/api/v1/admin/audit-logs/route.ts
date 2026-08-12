import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden: Admin access required' } }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action')

    const logs = await prisma.activityLog.findMany({
      where: action ? { action } : {},
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        actor: { select: { id: true, name: true, email: true, role: true } }
      }
    })

    return NextResponse.json({ success: true, data: logs }, { status: 200 })
  } catch (error: any) {
    console.error('Audit logs error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
