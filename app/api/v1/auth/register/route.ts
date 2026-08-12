import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  role: z.enum(['CANDIDATE', 'RECRUITER']).default('CANDIDATE'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name, role } = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ success: false, error: { message: 'Email already exists' } }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
      },
    })

    if (role === 'CANDIDATE') {
      await prisma.candidateProfile.create({
        data: {
          userId: user.id,
        },
      })
    }

    return NextResponse.json({ success: true, data: { id: user.id, email: user.email, role: user.role } }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: { message: 'Validation failed', details: error.errors } }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ success: false, error: { message: 'Internal Server Error' } }, { status: 500 })
  }
}
