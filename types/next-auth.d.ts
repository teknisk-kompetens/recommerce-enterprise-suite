
import NextAuth from "next-auth"
import { UserLevel, UserStatus } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      image?: string
      level: UserLevel
      status: UserStatus
      companyName?: string
      roles?: any[]
      branding?: any
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    image?: string
    level: UserLevel
    status: UserStatus
    companyName?: string
    roles?: any[]
    branding?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    level: UserLevel
    status: UserStatus
    companyName?: string
    roles?: any[]
    branding?: any
  }
}
