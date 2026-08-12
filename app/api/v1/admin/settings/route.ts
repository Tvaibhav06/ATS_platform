import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const setting = await prisma.settings.findFirst({ where: { key: 'PLATFORM_SETTINGS' } })
    let settingsData = {
      theme: 'LIGHT',
      emailNotifications: true,
      maxUploadSizeMb: 5
    }

    if (setting) {
      try {
        settingsData = { ...settingsData, ...JSON.parse(setting.value) }
      } catch (e) {}
    }

    return NextResponse.json({ success: true, data: settingsData }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await getSessionUser(request)
    if (!auth || auth.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: { message: 'Forbidden' } }, { status: 403 })
    }

    const body = await request.json()

    const existing = await prisma.settings.findFirst({ where: { key: 'PLATFORM_SETTINGS' } })
    
    let currentData = { theme: 'LIGHT', emailNotifications: true, maxUploadSizeMb: 5 }
    if (existing) {
      try { currentData = { ...currentData, ...JSON.parse(existing.value) } } catch (e) {}
    }

    const newData = { ...currentData, ...body }
    const stringValue = JSON.stringify(newData)

    let setting;
    if (existing) {
      setting = await prisma.settings.update({
        where: { id: existing.id },
        data: { value: stringValue }
      })
    } else {
      setting = await prisma.settings.create({
        data: {
          key: 'PLATFORM_SETTINGS',
          value: stringValue
        }
      })
    }

    await prisma.activityLog.create({
      data: {
        actorId: auth.userId,
        actorRole: auth.role,
        action: 'UPDATE_SETTINGS',
        entityType: 'SETTINGS',
        entityId: setting.id,
        metadata: JSON.stringify({ updatedKeys: Object.keys(body) })
      }
    })

    return NextResponse.json({ success: true, data: newData }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
