
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

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, message, type, actionUrl, targetUsers } = await request.json()

    // For master users, allow sending to multiple users
    if (session.user.level === 'MASTER' && targetUsers?.length) {
      const notifications = await prisma.notification.createMany({
        data: targetUsers.map((userId: string) => ({
          userId,
          title,
          message,
          type: type || 'info',
          actionUrl
        }))
      })

      return NextResponse.json({ 
        message: 'Notifications sent successfully',
        count: notifications.count
      })
    } else {
      // Single notification for current user
      const notification = await prisma.notification.create({
        data: {
          userId: session.user.id,
          title,
          message,
          type: type || 'info',
          actionUrl
        }
      })

      return NextResponse.json({ notification })
    }
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
