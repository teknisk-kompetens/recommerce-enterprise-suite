
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const level = searchParams.get('level') || ''
    const status = searchParams.get('status') || ''

    // Build where clause based on user level and permissions
    let whereClause: any = {}

    // Non-master users can only see their hierarchy
    if (session.user.level !== 'MASTER') {
      // Get user's hierarchy
      const userHierarchy = await getUserHierarchy(session.user.id)
      whereClause.id = { in: userHierarchy }
    }

    // Add filters
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (level) {
      whereClause.level = level
    }

    if (status) {
      whereClause.status = status
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          roles: {
            include: {
              role: true
            }
          },
          subscriptions: {
            include: {
              items: {
                include: {
                  module: true
                }
              }
            }
          },
          moduleAssignments: {
            include: {
              module: true
            }
          },
          children: {
            select: {
              id: true,
              name: true,
              email: true,
              level: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where: whereClause })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getUserHierarchy(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      children: {
        include: {
          children: {
            include: {
              children: true
            }
          }
        }
      }
    }
  })

  const hierarchy = [userId]
  
  function addChildren(user: any) {
    if (user.children) {
      user.children.forEach((child: any) => {
        hierarchy.push(child.id)
        addChildren(child)
      })
    }
  }

  if (user) {
    addChildren(user)
  }

  return hierarchy
}
