
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
    const category = searchParams.get('category') || ''
    const includeAssignments = searchParams.get('includeAssignments') === 'true'

    let whereClause: any = { isActive: true }

    if (category) {
      whereClause.category = category
    }

    const modules = await prisma.module.findMany({
      where: whereClause,
      include: {
        assignments: includeAssignments ? {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                level: true,
                companyName: true
              }
            }
          }
        } : false,
        subscriptionItems: includeAssignments ? {
          include: {
            subscription: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    companyName: true
                  }
                }
              }
            }
          }
        } : false
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ modules })
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id || session.user.level !== 'MASTER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const moduleData = await request.json()

    const module = await prisma.module.create({
      data: {
        name: moduleData.name,
        displayName: moduleData.displayName,
        description: moduleData.description,
        category: moduleData.category,
        price: moduleData.price || 0,
        features: moduleData.features || [],
        dependencies: moduleData.dependencies || [],
        iconUrl: moduleData.iconUrl,
        coverImageUrl: moduleData.coverImageUrl
      }
    })

    return NextResponse.json({ module })
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
