import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request)
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })

    const companies = await prisma.company.findMany({
      include: { _count: { select: { jobs: true, users: true } } }
    })
    return NextResponse.json({ success: true, data: companies })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: 'Server Error' } }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getSessionUser(request)
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })

    const { name, website, description } = await request.json()
    if (!name) return NextResponse.json({ success: false, error: { message: 'Name is required' } }, { status: 400 })

    const company = await prisma.company.create({ data: { name, website, description } })
    return NextResponse.json({ success: true, data: company }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: 'Server Error' } }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getSessionUser(request)
    if (!auth || auth.role !== 'ADMIN') return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })

    const { id, name, website, description } = await request.json()
    if (!id) return NextResponse.json({ success: false, error: { message: 'ID is required' } }, { status: 400 })

    const company = await prisma.company.update({
      where: { id },
      data: { ...(name && { name }), ...(website !== undefined && { website }), ...(description !== undefined && { description }) }
    })
    return NextResponse.json({ success: true, data: company })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: 'Server Error' } }, { status: 500 })
  }
}
