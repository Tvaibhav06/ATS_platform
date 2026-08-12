import { NextRequest, NextResponse } from 'next/server'
import { resumeStorage } from '@/lib/storage'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const file = searchParams.get('file')

  if (!file) {
    return new NextResponse('File parameter missing', { status: 400 })
  }

  // Retrieve file using the storage adapter (which will handle path traversal securely)
  const buffer = await resumeStorage.get(file)
  if (!buffer) {
    return new NextResponse('File not found', { status: 404 })
  }

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': file.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `inline; filename="${file}"`,
    },
  })
}
