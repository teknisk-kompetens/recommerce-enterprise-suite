
import { PrismaClient, UserLevel, UserStatus, ModuleCategory, SubscriptionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Create default roles and permissions
  const masterPermissions = [
    { name: 'users:create', description: 'Create users', resource: 'users', action: 'create' },
    { name: 'users:read', description: 'Read users', resource: 'users', action: 'read' },
    { name: 'users:update', description: 'Update users', resource: 'users', action: 'update' },
    { name: 'users:delete', description: 'Delete users', resource: 'users', action: 'delete' },
    { name: 'modules:create', description: 'Create modules', resource: 'modules', action: 'create' },
    { name: 'modules:read', description: 'Read modules', resource: 'modules', action: 'read' },
    { name: 'modules:update', description: 'Update modules', resource: 'modules', action: 'update' },
    { name: 'modules:delete', description: 'Delete modules', resource: 'modules', action: 'delete' },
    { name: 'billing:read', description: 'Read billing', resource: 'billing', action: 'read' },
    { name: 'billing:update', description: 'Update billing', resource: 'billing', action: 'update' },
    { name: 'system:admin', description: 'System administration', resource: 'system', action: 'admin' },
  ]

  const superPermissions = [
    { name: 'users:create', description: 'Create users', resource: 'users', action: 'create' },
    { name: 'users:read', description: 'Read users', resource: 'users', action: 'read' },
    { name: 'users:update', description: 'Update users', resource: 'users', action: 'update' },
    { name: 'modules:read', description: 'Read modules', resource: 'modules', action: 'read' },
    { name: 'billing:read', description: 'Read billing', resource: 'billing', action: 'read' },
  ]

  const companyPermissions = [
    { name: 'profile:read', description: 'Read own profile', resource: 'profile', action: 'read' },
    { name: 'profile:update', description: 'Update own profile', resource: 'profile', action: 'update' },
    { name: 'modules:read', description: 'Read assigned modules', resource: 'modules', action: 'read' },
  ]

  // Create permissions
  const createdPermissions = new Map()
  for (const perm of [...masterPermissions, ...superPermissions, ...companyPermissions]) {
    if (!createdPermissions.has(perm.name)) {
      const permission = await prisma.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: perm,
      })
      createdPermissions.set(perm.name, permission)
    }
  }

  // Create roles
  const masterRole = await prisma.role.upsert({
    where: { name: 'Master Admin' },
    update: {},
    create: {
      name: 'Master Admin',
      description: 'Full system access',
      level: UserLevel.MASTER,
      permissions: {
        connect: masterPermissions.map(p => ({ name: p.name })),
      },
    },
  })

  const superRole = await prisma.role.upsert({
    where: { name: 'Super Reseller' },
    update: {},
    create: {
      name: 'Super Reseller',
      description: 'Reseller with management capabilities',
      level: UserLevel.SUPER,
      permissions: {
        connect: superPermissions.map(p => ({ name: p.name })),
      },
    },
  })

  const resellerRole = await prisma.role.upsert({
    where: { name: 'Reseller' },
    update: {},
    create: {
      name: 'Reseller',
      description: 'Standard reseller access',
      level: UserLevel.RESELLER,
      permissions: {
        connect: superPermissions.map(p => ({ name: p.name })),
      },
    },
  })

  const companyRole = await prisma.role.upsert({
    where: { name: 'Company User' },
    update: {},
    create: {
      name: 'Company User',
      description: 'Standard company user access',
      level: UserLevel.COMPANY,
      permissions: {
        connect: companyPermissions.map(p => ({ name: p.name })),
      },
    },
  })

  // Create core modules
  const modules = [
    {
      name: 'crm_basic',
      displayName: 'CRM Basic',
      description: 'Basic customer relationship management',
      category: ModuleCategory.CRM,
      price: 29.99,
      features: ['Contact Management', 'Lead Tracking', 'Basic Reports'],
      iconUrl: 'https://cdn3.iconfinder.com/data/icons/crm-7/512/crm-19-512.png',
    },
    {
      name: 'crm_advanced',
      displayName: 'CRM Advanced',
      description: 'Advanced CRM with automation',
      category: ModuleCategory.CRM,
      price: 79.99,
      features: ['Advanced Automation', 'Custom Fields', 'Email Integration', 'Advanced Analytics'],
      dependencies: ['crm_basic'],
      iconUrl: 'https://i.pinimg.com/736x/81/b9/0c/81b90c47ed3eb000eba28b1534f10e9d.jpg',
    },
    {
      name: 'analytics_core',
      displayName: 'Analytics Core',
      description: 'Core analytics and reporting',
      category: ModuleCategory.ANALYTICS,
      price: 39.99,
      features: ['Dashboard', 'Custom Reports', 'Data Export'],
      iconUrl: 'https://static.vecteezy.com/system/resources/previews/035/193/516/original/analytics-dashboard-icon-line-illustration-vector.jpg',
    },
    {
      name: 'ecommerce_basic',
      displayName: 'E-commerce Basic',
      description: 'Basic e-commerce functionality',
      category: ModuleCategory.ECOMMERCE,
      price: 49.99,
      features: ['Product Catalog', 'Shopping Cart', 'Payment Processing'],
      iconUrl: 'https://static.vecteezy.com/system/resources/previews/010/577/253/original/e-commerce-icon-logo-illustration-shopping-cart-and-smartphone-symbol-template-for-graphic-and-web-design-collection-free-vector.jpg',
    },
    {
      name: 'marketing_suite',
      displayName: 'Marketing Suite',
      description: 'Comprehensive marketing tools',
      category: ModuleCategory.MARKETING,
      price: 59.99,
      features: ['Email Campaigns', 'Social Media Management', 'SEO Tools'],
      iconUrl: 'https://cdn2.iconfinder.com/data/icons/business-icons-2-3/256/Business_Advertising-512.png',
    },
    {
      name: 'ai_assistant',
      displayName: 'AI Assistant',
      description: 'AI-powered business assistant',
      category: ModuleCategory.AI_TOOLS,
      price: 99.99,
      features: ['Chat Assistant', 'Content Generation', 'Data Analysis'],
      iconUrl: 'https://cdn4.iconfinder.com/data/icons/professional-services-5/64/1-03-512.png',
    },
    {
      name: 'finance_manager',
      displayName: 'Finance Manager',
      description: 'Financial management and reporting',
      category: ModuleCategory.FINANCE,
      price: 69.99,
      features: ['Invoicing', 'Expense Tracking', 'Financial Reports'],
      iconUrl: 'https://static.vecteezy.com/system/resources/previews/028/180/805/original/finance-calculator-icon-flat-vector.jpg',
    },
    {
      name: 'integrations_hub',
      displayName: 'Integrations Hub',
      description: 'Third-party integrations and APIs',
      category: ModuleCategory.INTEGRATIONS,
      price: 89.99,
      features: ['API Connectors', 'Webhook Management', 'Data Sync'],
      iconUrl: 'https://i.pinimg.com/originals/59/06/20/5906201125f92bc51f0c1ef5cedeac7b.jpg',
    },
  ]

  const createdModules = new Map()
  for (const module of modules) {
    const created = await prisma.module.upsert({
      where: { name: module.name },
      update: {},
      create: module,
    })
    createdModules.set(module.name, created)
  }

  // Create test users
  const hashedPassword = await bcrypt.hash('johndoe123', 12)

  // Master admin user (Robin)
  const masterUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: hashedPassword,
      name: 'Robin Svensson',
      level: UserLevel.MASTER,
      status: UserStatus.ACTIVE,
      companyName: 're:Commerce Enterprise',
      website: 'https://recommerce.io',
      emailVerified: new Date(),
    },
  })

  // Super reseller
  const superUser = await prisma.user.upsert({
    where: { email: 'jane@doe.com' },
    update: {},
    create: {
      email: 'jane@doe.com',
      password: hashedPassword,
      name: 'Jane Smith',
      level: UserLevel.SUPER,
      status: UserStatus.ACTIVE,
      parentId: masterUser.id,
      companyName: 'Elite Solutions Inc',
      website: 'https://elitesolutions.com',
      emailVerified: new Date(),
    },
  })

  // Company user
  const companyUser = await prisma.user.upsert({
    where: { email: 'joe@doe.com' },
    update: {},
    create: {
      email: 'joe@doe.com',
      password: hashedPassword,
      name: 'Joe Wilson',
      level: UserLevel.COMPANY,
      status: UserStatus.ACTIVE,
      parentId: superUser.id,
      companyName: 'Wilson Enterprises',
      website: 'https://wilsonenterprises.com',
      emailVerified: new Date(),
    },
  })

  // Assign roles to users
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: masterUser.id, roleId: masterRole.id } },
    update: {},
    create: {
      userId: masterUser.id,
      roleId: masterRole.id,
    },
  })

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: superUser.id, roleId: superRole.id } },
    update: {},
    create: {
      userId: superUser.id,
      roleId: superRole.id,
    },
  })

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: companyUser.id, roleId: companyRole.id } },
    update: {},
    create: {
      userId: companyUser.id,
      roleId: companyRole.id,
    },
  })

  // Create subscriptions for users
  const masterSubscription = await prisma.subscription.create({
    data: {
      userId: masterUser.id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      totalAmount: 0, // Master gets everything free
      currency: 'USD',
      billingCycle: 'yearly',
    },
  })

  const superSubscription = await prisma.subscription.create({
    data: {
      userId: superUser.id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      totalAmount: 299.99,
      currency: 'USD',
      billingCycle: 'monthly',
    },
  })

  const companySubscription = await prisma.subscription.create({
    data: {
      userId: companyUser.id,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      totalAmount: 149.99,
      currency: 'USD',
      billingCycle: 'monthly',
    },
  })

  // Assign modules to users
  const moduleAssignments = [
    // Master gets all modules
    ...modules.map(module => ({
      userId: masterUser.id,
      moduleId: createdModules.get(module.name).id,
      isActive: true,
    })),
    // Super user gets premium modules
    { userId: superUser.id, moduleId: createdModules.get('crm_advanced').id, isActive: true },
    { userId: superUser.id, moduleId: createdModules.get('analytics_core').id, isActive: true },
    { userId: superUser.id, moduleId: createdModules.get('marketing_suite').id, isActive: true },
    { userId: superUser.id, moduleId: createdModules.get('finance_manager').id, isActive: true },
    // Company user gets basic modules
    { userId: companyUser.id, moduleId: createdModules.get('crm_basic').id, isActive: true },
    { userId: companyUser.id, moduleId: createdModules.get('analytics_core').id, isActive: true },
    { userId: companyUser.id, moduleId: createdModules.get('ecommerce_basic').id, isActive: true },
  ]

  for (const assignment of moduleAssignments) {
    await prisma.moduleAssignment.upsert({
      where: { userId_moduleId: { userId: assignment.userId, moduleId: assignment.moduleId } },
      update: {},
      create: assignment,
    })
  }

  // Create subscription items
  const subscriptionItems = [
    // Super user subscription items
    { subscriptionId: superSubscription.id, moduleId: createdModules.get('crm_advanced').id, quantity: 1, unitPrice: 79.99, totalPrice: 79.99 },
    { subscriptionId: superSubscription.id, moduleId: createdModules.get('analytics_core').id, quantity: 1, unitPrice: 39.99, totalPrice: 39.99 },
    { subscriptionId: superSubscription.id, moduleId: createdModules.get('marketing_suite').id, quantity: 1, unitPrice: 59.99, totalPrice: 59.99 },
    { subscriptionId: superSubscription.id, moduleId: createdModules.get('finance_manager').id, quantity: 1, unitPrice: 69.99, totalPrice: 69.99 },
    // Company user subscription items
    { subscriptionId: companySubscription.id, moduleId: createdModules.get('crm_basic').id, quantity: 1, unitPrice: 29.99, totalPrice: 29.99 },
    { subscriptionId: companySubscription.id, moduleId: createdModules.get('analytics_core').id, quantity: 1, unitPrice: 39.99, totalPrice: 39.99 },
    { subscriptionId: companySubscription.id, moduleId: createdModules.get('ecommerce_basic').id, quantity: 1, unitPrice: 49.99, totalPrice: 49.99 },
  ]

  for (const item of subscriptionItems) {
    await prisma.subscriptionItem.upsert({
      where: { subscriptionId_moduleId: { subscriptionId: item.subscriptionId, moduleId: item.moduleId } },
      update: {},
      create: item,
    })
  }

  // Create API keys for users
  await prisma.apiKey.create({
    data: {
      userId: masterUser.id,
      name: 'Master API Key',
      key: 'rce_master_' + Math.random().toString(36).substring(2, 15),
      permissions: { admin: true, modules: ['*'], actions: ['*'] },
      isActive: true,
      rateLimit: 10000,
    },
  })

  await prisma.apiKey.create({
    data: {
      userId: superUser.id,
      name: 'Reseller API Key',
      key: 'rce_super_' + Math.random().toString(36).substring(2, 15),
      permissions: { modules: ['crm', 'analytics', 'marketing'], actions: ['read', 'write'] },
      isActive: true,
      rateLimit: 5000,
    },
  })

  // Create sample branding for users
  await prisma.companyBranding.upsert({
    where: { userId: masterUser.id },
    update: {},
    create: {
      userId: masterUser.id,
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      accentColor: '#F59E0B',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      brandName: 're:Commerce Enterprise',
      tagline: 'The Future of SaaS',
      logoUrl: 'https://i.pinimg.com/originals/96/c1/72/96c1720919baa5c867e1f4f2afc2a4f3.png',
    },
  })

  await prisma.companyBranding.upsert({
    where: { userId: superUser.id },
    update: {},
    create: {
      userId: superUser.id,
      primaryColor: '#10B981',
      secondaryColor: '#059669',
      accentColor: '#F59E0B',
      backgroundColor: '#FFFFFF',
      textColor: '#1F2937',
      brandName: 'Elite Solutions',
      tagline: 'Premium Business Solutions',
      logoUrl: 'https://media.licdn.com/dms/image/C560BAQEerROl7ov1yA/company-logo_200_200/0/1589387462114?e=2147483647&v=beta&t=muEvaD3dT_5LyBOdb18wLaQModCAoOKFYFnvVZ1YQBE',
    },
  })

  // Create sample notifications
  await prisma.notification.create({
    data: {
      userId: masterUser.id,
      title: 'Welcome to re:Commerce Enterprise',
      message: 'Your multi-level SaaS platform is ready! Start managing your ecosystem.',
      type: 'success',
      isRead: false,
    },
  })

  await prisma.notification.create({
    data: {
      userId: superUser.id,
      title: 'New Module Available',
      message: 'AI Assistant module is now available for upgrade.',
      type: 'info',
      isRead: false,
    },
  })

  // Create sample user activities
  const activities = [
    { userId: masterUser.id, action: 'login', resource: 'dashboard', metadata: { ip: '192.168.1.1' } },
    { userId: masterUser.id, action: 'module_accessed', resource: 'user_management', metadata: { duration: 1200 } },
    { userId: superUser.id, action: 'login', resource: 'dashboard', metadata: { ip: '192.168.1.2' } },
    { userId: superUser.id, action: 'module_accessed', resource: 'crm_advanced', metadata: { duration: 900 } },
    { userId: companyUser.id, action: 'login', resource: 'dashboard', metadata: { ip: '192.168.1.3' } },
    { userId: companyUser.id, action: 'module_accessed', resource: 'crm_basic', metadata: { duration: 600 } },
  ]

  for (const activity of activities) {
    await prisma.userActivity.create({ data: activity })
  }

  // Create system settings
  await prisma.systemSettings.upsert({
    where: { key: 'platform_settings' },
    update: {},
    create: {
      key: 'platform_settings',
      value: {
        maintenanceMode: false,
        allowSignups: true,
        defaultTrialDays: 14,
        maxUsersPerReseller: 100,
        commissionRate: 0.15,
      },
    },
  })

  console.log('✅ Seed completed successfully!')
  console.log(`
🎉 re:Commerce Enterprise Suite is ready!

👤 Test Accounts:
- Master Admin: john@doe.com / johndoe123
- Super Reseller: jane@doe.com / johndoe123  
- Company User: joe@doe.com / johndoe123

📊 Database populated with:
- ${modules.length} modules across all categories
- Role-based permission system
- Sample subscriptions and billing
- API keys for integrations
- Company branding settings
- User activities and notifications
`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
