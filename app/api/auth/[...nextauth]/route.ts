
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = "force-dynamic"

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: true
                  }
                }
              }
            },
            branding: true
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        })

        // Log user activity
        await prisma.userActivity.create({
          data: {
            userId: user.id,
            action: 'login',
            resource: 'dashboard',
            metadata: {
              timestamp: new Date().toISOString()
            }
          }
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          image: user.image || undefined,
          level: user.level,
          status: user.status,
          companyName: user.companyName || undefined,
          roles: user.roles?.map(ur => ur.role) || [],
          branding: user.branding
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.level = user.level
        token.status = user.status
        token.companyName = user.companyName
        token.roles = user.roles
        token.branding = user.branding
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.level = token.level
        session.user.status = token.status
        session.user.companyName = token.companyName
        session.user.roles = token.roles
        session.user.branding = token.branding
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
})

export { handler as GET, handler as POST }
