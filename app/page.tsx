
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { AuthSection } from '@/components/auth-section'

export default async function HomePage() {
  const session = await getServerSession()
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                re:Commerce Enterprise
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The revolutionary multi-level SaaS ecosystem powering the next generation of business management platforms
              </p>
            </div>

            <div className="flex justify-center space-x-8 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Multi-Tenant Architecture</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>AI-Powered Intelligence</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span>Real-Time Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Master Level Control</h3>
            <p className="text-gray-600 text-sm">Complete ecosystem management with unlimited user hierarchy and module control</p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Modular Architecture</h3>
            <p className="text-gray-600 text-sm">Drag-and-drop module assignments with real-time billing and usage tracking</p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">White Label Branding</h3>
            <p className="text-gray-600 text-sm">Full customization with brand colors, logos, and personalized experiences</p>
          </div>
        </div>

        {/* Auth Section */}
        <AuthSection />
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">∞</div>
              <div className="text-blue-100">Scalable Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">8+</div>
              <div className="text-blue-100">Core Modules</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Real-Time Monitoring</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime SLA</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
