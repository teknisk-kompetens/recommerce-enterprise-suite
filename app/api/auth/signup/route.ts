
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import { UserLevel, UserStatus } from '@prisma/client'

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, companyName, level = UserLevel.COMPANY } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        companyName,
        level,
        status: UserStatus.ACTIVE,
        emailVerified: new Date()
      }
    })

    // Assign default role based on level
    const roleMapping: Record<string, string> = {
      [UserLevel.MASTER]: 'Master Admin',
      [UserLevel.SUPER]: 'Super Reseller',
      [UserLevel.RESELLER]: 'Reseller',
      [UserLevel.AFFILIATE]: 'Reseller',
      [UserLevel.COMPANY]: 'Company User'
    }

    const defaultRole = await prisma.role.findFirst({
      where: { name: roleMapping[level] }
    })

    if (defaultRole) {
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: defaultRole.id
        }
      })
    }

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to re:Commerce Enterprise!',
        message: 'Your account has been created successfully. Explore our modules and start building your business.',
        type: 'success'
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        level: user.level
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
