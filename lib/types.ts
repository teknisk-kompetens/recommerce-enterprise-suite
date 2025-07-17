
export interface User {
  id: string
  email: string
  name?: string
  image?: string
  level: UserLevel
  status: UserStatus
  parentId?: string
  companyName?: string
  website?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  children?: User[]
  parent?: User
  roles?: UserRole[]
  branding?: CompanyBranding
  subscriptions?: Subscription[]
}

export interface UserRole {
  id: string
  userId: string
  roleId: string
  role: Role
  assignedAt: Date
}

export interface Role {
  id: string
  name: string
  description?: string
  level: UserLevel
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string
  description?: string
  resource: string
  action: string
}

export interface Module {
  id: string
  name: string
  displayName: string
  description: string
  category: ModuleCategory
  version: string
  price: number
  isActive: boolean
  features?: string[]
  dependencies: string[]
  iconUrl?: string
  coverImageUrl?: string
  assignments?: ModuleAssignment[]
}

export interface ModuleAssignment {
  id: string
  userId: string
  moduleId: string
  isActive: boolean
  settings?: any
  assignedAt: Date
  expiresAt?: Date
  module: Module
}

export interface Subscription {
  id: string
  userId: string
  status: SubscriptionStatus
  currentPeriodStart: Date
  currentPeriodEnd: Date
  totalAmount: number
  currency: string
  billingCycle: string
  items: SubscriptionItem[]
}

export interface SubscriptionItem {
  id: string
  subscriptionId: string
  moduleId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  module: Module
}

export interface CompanyBranding {
  id: string
  userId: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  backgroundColor?: string
  textColor?: string
  logoUrl?: string
  faviconUrl?: string
  brandName?: string
  tagline?: string
  customCss?: string
  customDomain?: string
}

export interface ApiKey {
  id: string
  userId: string
  name: string
  key: string
  permissions?: any
  isActive: boolean
  lastUsedAt?: Date
  usageCount: number
  rateLimit: number
  createdAt: Date
  expiresAt?: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  actionUrl?: string
  createdAt: Date
  readAt?: Date
}

export interface UserActivity {
  id: string
  userId: string
  action: string
  resource?: string
  metadata?: any
  timestamp: Date
  user?: User
}

export interface UsageMetric {
  id: string
  userId: string
  moduleId?: string
  metric: string
  value: number
  unit?: string
  timestamp: Date
  module?: Module
}

export interface Commission {
  id: string
  earnerId: string
  generatorId: string
  amount: number
  percentage: number
  description?: string
  status: string
  createdAt: Date
  paidAt?: Date
  earner: User
  generator: User
}

export enum UserLevel {
  MASTER = 'MASTER',
  SUPER = 'SUPER',
  RESELLER = 'RESELLER',
  AFFILIATE = 'AFFILIATE',
  COMPANY = 'COMPANY'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CANCELED = 'CANCELED',
  PAST_DUE = 'PAST_DUE',
  TRIALING = 'TRIALING'
}

export enum ModuleCategory {
  CRM = 'CRM',
  ANALYTICS = 'ANALYTICS',
  ECOMMERCE = 'ECOMMERCE',
  MARKETING = 'MARKETING',
  FINANCE = 'FINANCE',
  INTEGRATIONS = 'INTEGRATIONS',
  AI_TOOLS = 'AI_TOOLS',
  CUSTOM = 'CUSTOM'
}

export interface DashboardMetrics {
  totalUsers: number
  activeUsers: number
  totalRevenue: number
  monthlyRecurringRevenue: number
  activeSubscriptions: number
  moduleAssignments: number
  apiCalls24h: number
  conversionRate: number
}

export interface ModuleUsageStats {
  moduleId: string
  moduleName: string
  totalUsers: number
  activeUsers: number
  revenue: number
  usageMetrics: {
    metric: string
    value: number
    unit: string
  }[]
}

export interface UserHierarchyNode {
  user: User
  children: UserHierarchyNode[]
  level: number
  metrics: {
    childrenCount: number
    totalRevenue: number
    activeModules: number
  }
}

export interface BulkOperation {
  id: string
  type: 'MODULE_ASSIGN' | 'STATUS_UPDATE' | 'ROLE_ASSIGN' | 'BULK_MESSAGE'
  targetUsers: string[]
  payload: any
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  progress: number
  createdAt: Date
  completedAt?: Date
  errors?: string[]
}

export interface UpsellRecommendation {
  userId: string
  moduleId: string
  module: Module
  score: number
  reasoning: string[]
  potentialRevenue: number
  confidence: number
}

export interface WebSocketMessage {
  type: 'NOTIFICATION' | 'USER_UPDATE' | 'MODULE_UPDATE' | 'DEMO_INVITE' | 'SYSTEM_ALERT'
  payload: any
  timestamp: Date
  targetUsers?: string[]
}

export interface SystemHealth {
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL'
  uptime: number
  activeConnections: number
  responseTime: number
  errorRate: number
  databaseStatus: 'CONNECTED' | 'DISCONNECTED' | 'SLOW'
  services: {
    name: string
    status: 'UP' | 'DOWN' | 'DEGRADED'
    responseTime?: number
  }[]
}
