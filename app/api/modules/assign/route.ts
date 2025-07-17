
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId, moduleId, isActive = true, settings } = await request.json()

    // Check permissions - only master or super users can assign modules
    if (!['MASTER', 'SUPER', 'RESELLER'].includes(session.user.level)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // For non-master users, ensure they can only assign to their hierarchy
    if (session.user.level !== 'MASTER') {
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
        include: { parent: true }
      })

      if (!targetUser || (targetUser.parentId !== session.user.id && targetUser.id !== session.user.id)) {
        return NextResponse.json({ error: 'Cannot assign modules to this user' }, { status: 403 })
      }
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.moduleAssignment.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId
        }
      }
    })

    let assignment
    if (existingAssignment) {
      // Update existing assignment
      assignment = await prisma.moduleAssignment.update({
        where: {
          userId_moduleId: {
            userId,
            moduleId
          }
        },
        data: {
          isActive,
          settings,
          assignedBy: session.user.id
        },
        include: {
          module: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true
            }
          }
        }
      })
    } else {
      // Create new assignment
      assignment = await prisma.moduleAssignment.create({
        data: {
          userId,
          moduleId,
          isActive,
          settings,
          assignedBy: session.user.id
        },
        include: {
          module: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true
            }
          }
        }
      })
    }

    // Create notification for the user
    await prisma.notification.create({
      data: {
        userId,
        title: `Module ${isActive ? 'Assigned' : 'Deactivated'}`,
        message: `${assignment.module.displayName} has been ${isActive ? 'assigned to your account' : 'deactivated'}.`,
        type: isActive ? 'success' : 'warning'
      }
    })

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: session.user.id,
        action: 'module_assigned',
        resource: 'module',
        metadata: {
          targetUserId: userId,
          moduleId,
          moduleName: assignment.module.name,
          isActive
        }
      }
    })

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error('Error assigning module:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
