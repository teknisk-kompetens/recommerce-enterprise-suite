
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

    const { userId } = await request.json()

    // Get user data for analysis
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        moduleAssignments: {
          include: { module: true }
        },
        subscriptions: {
          include: {
            items: {
              include: { module: true }
            }
          }
        },
        usageTracking: {
          where: {
            timestamp: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        },
        activities: {
          where: {
            timestamp: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Use LLM to generate intelligent recommendations
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{
          role: 'user',
          content: `Analyze this user's data and recommend modules for upselling:

User Profile:
- Name: ${user.name}
- Company: ${user.companyName}
- Level: ${user.level}
- Current Modules: ${user.moduleAssignments.map(ma => ma.module.displayName).join(', ')}
- Recent Activities: ${user.activities.length} activities in last 30 days
- Usage Patterns: ${user.usageTracking.length} usage events

Available Modules:
- CRM Advanced ($79.99) - Advanced automation, custom fields, email integration
- AI Assistant ($99.99) - Chat assistant, content generation, data analysis
- Marketing Suite ($59.99) - Email campaigns, social media, SEO tools
- Finance Manager ($69.99) - Invoicing, expense tracking, financial reports
- Integrations Hub ($89.99) - API connectors, webhook management, data sync

Please provide 3 specific module recommendations with:
1. Module name and reasoning (why this user needs it)
2. Confidence score (0-100)
3. Potential revenue impact
4. Key selling points

Respond in JSON format with this structure:
{
  "recommendations": [
    {
      "moduleName": "string",
      "reasoning": ["reason1", "reason2", "reason3"],
      "confidence": number,
      "potentialRevenue": number,
      "sellingPoints": ["point1", "point2"],
      "priority": "high|medium|low"
    }
  ]
}`
        }],
        response_format: { type: "json_object" },
        max_tokens: 1500
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get AI recommendations')
    }

    const aiResponse = await response.json()
    const recommendations = JSON.parse(aiResponse.choices[0].message.content)

    // Get actual module data for the recommendations
    const moduleNames = recommendations.recommendations.map((r: any) => 
      r.moduleName.toLowerCase().replace(/\s+/g, '_')
    )

    const modules = await prisma.module.findMany({
      where: {
        name: { in: moduleNames }
      }
    })

    // Combine AI recommendations with actual module data
    const enrichedRecommendations = recommendations.recommendations.map((rec: any) => {
      const module = modules.find(m => 
        m.name === rec.moduleName.toLowerCase().replace(/\s+/g, '_') ||
        m.displayName === rec.moduleName
      )

      return {
        ...rec,
        module: module || null,
        userId,
        score: rec.confidence
      }
    }).filter((rec: any) => rec.module) // Only include recommendations with valid modules

    return NextResponse.json({ recommendations: enrichedRecommendations })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    
    // Fallback to rule-based recommendations if AI fails
    const fallbackRecommendations = await generateFallbackRecommendations(request)
    return NextResponse.json({ 
      recommendations: fallbackRecommendations,
      fallback: true 
    })
  }
}

async function generateFallbackRecommendations(request: NextRequest) {
  const { userId } = await request.json()
  
  // Simple rule-based recommendations as fallback
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      moduleAssignments: {
        include: { module: true }
      }
    }
  })

  const currentModules = user?.moduleAssignments.map(ma => ma.module.name) || []
  const allModules = await prisma.module.findMany({ where: { isActive: true } })

  const recommendations = allModules
    .filter(module => !currentModules.includes(module.name))
    .slice(0, 3)
    .map(module => ({
      moduleName: module.displayName,
      reasoning: [`Perfect complement to your current setup`, `Highly requested by similar businesses`],
      confidence: 75,
      potentialRevenue: module.price,
      sellingPoints: Array.isArray(module.features) 
        ? (module.features as string[]).slice(0, 2) 
        : [`Feature 1`, `Feature 2`],
      priority: 'medium',
      module,
      userId,
      score: 75
    }))

  return recommendations
}
