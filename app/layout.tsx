
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 're:Commerce Enterprise Suite',
  description: 'Revolutionary Multi-Level SaaS Platform - The Future of Business Management',
  keywords: 'SaaS, Multi-tenant, CRM, Analytics, E-commerce, Business Management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
