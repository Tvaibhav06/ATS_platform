import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request)
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')

    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      select: { id: true, name: true, email: true, role: true, companyId: true, createdAt: true }
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: 'Server Error' } }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getSessionUser(request)
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const body = await request.json()
    const { userId, role, companyId } = body

    if (!userId) return NextResponse.json({ success: false, error: { message: 'Missing userId' } }, { status: 400 })

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(companyId !== undefined && { companyId })
      }
    })

    await prisma.activityLog.create({
      data: {
        actorId: auth.userId,
        actorRole: auth.role,
        action: 'UPDATE_USER',
        entityType: 'USER',
        entityId: updated.id,
        metadata: JSON.stringify({ role, companyId })
      }
    })

    return NextResponse.json({ success: true, data: { id: updated.id, role: updated.role, companyId: updated.companyId } })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: 'Server Error' } }, { status: 500 })
  }
}
