import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getSessionUser } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const auth = await getSessionUser(request)
    if (!auth) return NextResponse.json({ success: false, error: { message: 'Unauthorized' } }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') // optional: 'CANDIDATE' | 'JOB' | 'COMPANY' | 'RECRUITER' | 'INTERVIEW'

    if (!query || query.length < 2) {
      return NextResponse.json({ success: false, error: { message: 'Query too short' } }, { status: 400 })
    }

    const actingUser = await prisma.user.findUnique({ where: { id: auth.userId } })
    const role = auth.role
    const companyId = actingUser?.companyId

    let results: any = {}

    // Jobs
    if (!type || type === 'JOB') {
      results.jobs = await prisma.job.findMany({
        where: {
          title: { contains: query, mode: 'insensitive' },
          ...(role === 'ADMIN' ? {} : role === 'CANDIDATE' ? { status: 'OPEN' } : { companyId })
        },
        take: 10
      })
    }

    // Companies
    if (!type || type === 'COMPANY') {
      if (role === 'ADMIN' || role === 'CANDIDATE') {
        results.companies = await prisma.company.findMany({
          where: { name: { contains: query, mode: 'insensitive' } },
          take: 10
        })
      }
    }

    // Candidates
    if (!type || type === 'CANDIDATE') {
      if (role === 'ADMIN') {
        results.candidates = await prisma.user.findMany({
          where: { role: 'CANDIDATE', name: { contains: query, mode: 'insensitive' } },
          take: 10
        })
      } else if (role === 'RECRUITER' || role === 'HIRING_MANAGER') {
        // Only candidates who applied to their company
        results.candidates = await prisma.user.findMany({
          where: {
            role: 'CANDIDATE',
            name: { contains: query, mode: 'insensitive' },
            applications: { some: { job: { companyId } } }
          },
          take: 10
        })
      }
    }

    // Recruiters
    if (!type || type === 'RECRUITER') {
      if (role === 'ADMIN') {
        results.recruiters = await prisma.user.findMany({
          where: { role: 'RECRUITER', name: { contains: query, mode: 'insensitive' } },
          take: 10
        })
      } else if (role === 'RECRUITER' || role === 'HIRING_MANAGER') {
        results.recruiters = await prisma.user.findMany({
          where: { role: 'RECRUITER', name: { contains: query, mode: 'insensitive' }, companyId },
          take: 10
        })
      }
    }

    // Interviews
    if (!type || type === 'INTERVIEW') {
      if (role === 'ADMIN') {
        results.interviews = await prisma.interview.findMany({
          // Searching interviews by candidate name or job title could be tricky, 
          // let's assume we search by type or meetingLink as a simple text search, 
          // or join on candidate name.
          where: {
            application: {
              candidate: { name: { contains: query, mode: 'insensitive' } }
            }
          },
          take: 10
        })
      } else if (role === 'RECRUITER' || role === 'HIRING_MANAGER') {
        results.interviews = await prisma.interview.findMany({
          where: {
            application: {
              job: { companyId },
              candidate: { name: { contains: query, mode: 'insensitive' } }
            }
          },
          take: 10
        })
      }
    }

    return NextResponse.json({ success: true, data: results }, { status: 200 })
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal Server Error' } }, { status: 500 })
  }
}
