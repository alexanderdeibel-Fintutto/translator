// Fintutto World — CRM Target Group Segments & Sales Pipeline Types
// Matches the schema from 022_crm_sales_pipeline.sql

// ============================================================================
// Enums / Literal Unions (mirror DB CHECK constraints)
// ============================================================================

export type CrmSegmentId =
  | 'museum_small' | 'museum_medium' | 'museum_large'
  | 'city_small' | 'city_medium' | 'city_large'
  | 'region' | 'hotel' | 'resort' | 'cruise' | 'event'
  | 'partner' | 'enterprise' | 'other'

export type LeadStatus =
  | 'new' | 'contacted' | 'qualified' | 'demo_scheduled' | 'demo_done'
  | 'proposal_sent' | 'negotiation' | 'closed_won' | 'closed_lost'
  | 'churned' | 'reactivated'

export type LeadSource =
  | 'website' | 'referral' | 'event' | 'cold_outreach'
  | 'partner' | 'inbound' | 'import' | 'linkedin'

export type LeadPriority = 'low' | 'normal' | 'high' | 'urgent'

export type CompanySize = 'micro' | 'small' | 'medium' | 'large' | 'enterprise'

export type DecisionTimeline =
  | 'immediate' | '1_month' | '3_months' | '6_months' | 'next_year'

export type CampaignType =
  | 'email' | 'event' | 'referral' | 'cold_outreach'
  | 'content' | 'webinar' | 'partnership'

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'

export type ActivityType =
  | 'email_sent' | 'email_opened' | 'email_clicked'
  | 'call_made' | 'call_received'
  | 'meeting_scheduled' | 'meeting_held'
  | 'demo_given' | 'proposal_sent'
  | 'contract_sent' | 'contract_signed'
  | 'note_added' | 'status_changed'
  | 'invite_sent' | 'invite_opened' | 'landing_page_visited'
  | 'registered'
  | 'task_created' | 'task_completed'

export type TaskType =
  | 'follow_up' | 'call' | 'email' | 'meeting' | 'demo'
  | 'proposal' | 'contract' | 'onboarding' | 'other'

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue'

// ============================================================================
// DB Row Types
// ============================================================================

export interface CrmLead {
  id: string
  segmentId: CrmSegmentId
  status: LeadStatus
  source: LeadSource | null
  priority: LeadPriority
  score: number

  // Contact info
  companyName: string | null
  companyWebsite: string | null
  companySize: CompanySize | null
  industry: string | null
  contactFirstName: string | null
  contactLastName: string | null
  contactEmail: string | null
  contactPhone: string | null
  contactTitle: string | null
  contactLinkedin: string | null

  // Address
  address: Record<string, unknown>
  city: string | null
  region: string | null
  country: string

  // Qualification
  estimatedPoiCount: number | null
  estimatedLanguages: number
  estimatedMonthlyVisitors: number | null
  currentSolution: string | null
  budgetConfirmed: boolean
  decisionTimeline: DecisionTimeline | null

  // Assignment
  assignedTo: string | null
  assignedAt: string | null

  // Tier / pricing
  targetTierId: string | null
  proposedMonthlyEur: number | null
  discountPercent: number

  // Conversion
  convertedEntityType: string | null
  convertedEntityId: string | null
  convertedAt: string | null

  // Invite
  inviteCode: string | null
  inviteLandingUrl: string | null
  inviteSentAt: string | null
  inviteOpenedAt: string | null
  inviteClickedAt: string | null
  inviteRegisteredAt: string | null

  // Tags / notes
  tags: string[]
  internalNotes: string | null

  // Meta
  lastContactedAt: string | null
  nextFollowupAt: string | null
  lostReason: string | null
  createdAt: string
  updatedAt: string
}

export interface CrmActivity {
  id: string
  leadId: string
  activityType: ActivityType
  title: string
  description: string | null
  metadata: Record<string, unknown>
  performedBy: string | null
  createdAt: string
}

export interface CrmInviteCode {
  id: string
  code: string
  leadId: string | null
  segmentId: string
  tierId: string | null
  campaignId: string | null
  landingConfig: Record<string, unknown>
  customMessage: string | null
  customOffer: Record<string, unknown>
  visits: number
  registrations: number
  firstVisitedAt: string | null
  lastVisitedAt: string | null
  registeredUserId: string | null
  validFrom: string
  validUntil: string | null
  maxUses: number
  isActive: boolean
  createdBy: string | null
  createdAt: string
}

export interface CrmCampaign {
  id: string
  name: string
  description: string | null
  campaignType: CampaignType
  targetSegments: string[]
  status: CampaignStatus
  emailSubject: string | null
  emailTemplate: Record<string, unknown>
  landingPageConfig: Record<string, unknown>
  totalSent: number
  totalOpened: number
  totalClicked: number
  totalRegistered: number
  totalConverted: number
  scheduledAt: string | null
  startedAt: string | null
  completedAt: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface CrmTask {
  id: string
  leadId: string
  assignedTo: string | null
  title: string
  description: string | null
  taskType: TaskType
  priority: TaskPriority
  status: TaskStatus
  dueAt: string | null
  completedAt: string | null
  completedBy: string | null
  createdAt: string
}

export interface CrmPipelineStage {
  id: string
  segmentId: string
  stageName: string
  stageOrder: number
  description: string | null
  autoActions: Record<string, unknown>
  expectedDays: number | null
  isActive: boolean
  createdAt: string
}

export interface CrmEmailTemplate {
  id: string
  templateKey: string
  segmentId: string | null
  language: string
  subject: string
  bodyHtml: string
  bodyText: string | null
  variables: string[]
  isActive: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Segment Configuration (static metadata per target group)
// ============================================================================

export interface SegmentConfig {
  id: CrmSegmentId
  label: string
  description: string
  icon: string
  typicalPoiCount: [number, number]   // [min, max]
  typicalLanguages: [number, number]
  typicalMonthlyVisitors: [number, number]
  recommendedTier: string
  salesCycleWeeks: [number, number]
  keyFeatures: string[]
  commonObjections: string[]
}

export const CRM_SEGMENTS: Record<CrmSegmentId, SegmentConfig> = {
  museum_small: {
    id: 'museum_small',
    label: 'Kleines Museum',
    description: 'Lokale Museen, Heimatmuseen, Galerien mit bis zu 50 POIs',
    icon: 'building',
    typicalPoiCount: [10, 50],
    typicalLanguages: [2, 4],
    typicalMonthlyVisitors: [500, 5_000],
    recommendedTier: 'starter',
    salesCycleWeeks: [2, 4],
    keyFeatures: ['audio_guide', 'ai_chat', 'multilingual'],
    commonObjections: ['budget', 'tech_complexity', 'staff_time'],
  },
  museum_medium: {
    id: 'museum_medium',
    label: 'Mittleres Museum',
    description: 'Stadtmuseen, Fachmuseen mit 50-200 POIs',
    icon: 'building-2',
    typicalPoiCount: [50, 200],
    typicalLanguages: [3, 8],
    typicalMonthlyVisitors: [5_000, 30_000],
    recommendedTier: 'professional',
    salesCycleWeeks: [3, 6],
    keyFeatures: ['audio_guide', 'ai_chat', 'multilingual', 'analytics', 'tours'],
    commonObjections: ['integration', 'existing_system', 'data_migration'],
  },
  museum_large: {
    id: 'museum_large',
    label: 'Grosses Museum',
    description: 'Landesmuseen, Nationalmuseen mit 200+ POIs',
    icon: 'landmark',
    typicalPoiCount: [200, 2_000],
    typicalLanguages: [5, 15],
    typicalMonthlyVisitors: [30_000, 500_000],
    recommendedTier: 'enterprise',
    salesCycleWeeks: [6, 16],
    keyFeatures: ['audio_guide', 'ai_chat', 'multilingual', 'analytics', 'tours', 'api', 'custom_branding'],
    commonObjections: ['procurement_process', 'security', 'scalability', 'existing_contracts'],
  },
  city_small: {
    id: 'city_small',
    label: 'Kleinstadt',
    description: 'Staedte bis 50.000 Einwohner mit touristischem Angebot',
    icon: 'home',
    typicalPoiCount: [20, 100],
    typicalLanguages: [2, 5],
    typicalMonthlyVisitors: [1_000, 10_000],
    recommendedTier: 'starter',
    salesCycleWeeks: [3, 6],
    keyFeatures: ['city_guide', 'multilingual', 'poi_map', 'local_tips'],
    commonObjections: ['budget', 'political_decision', 'lack_of_content'],
  },
  city_medium: {
    id: 'city_medium',
    label: 'Mittelstadt',
    description: 'Staedte 50.000-250.000 Einwohner',
    icon: 'building-2',
    typicalPoiCount: [100, 500],
    typicalLanguages: [3, 8],
    typicalMonthlyVisitors: [10_000, 100_000],
    recommendedTier: 'professional',
    salesCycleWeeks: [4, 10],
    keyFeatures: ['city_guide', 'multilingual', 'poi_map', 'tours', 'events', 'analytics'],
    commonObjections: ['procurement', 'stakeholder_alignment', 'integration'],
  },
  city_large: {
    id: 'city_large',
    label: 'Grossstadt',
    description: 'Staedte ab 250.000 Einwohner mit umfangreichem Tourismusangebot',
    icon: 'landmark',
    typicalPoiCount: [500, 5_000],
    typicalLanguages: [5, 15],
    typicalMonthlyVisitors: [100_000, 2_000_000],
    recommendedTier: 'enterprise',
    salesCycleWeeks: [8, 24],
    keyFeatures: ['city_guide', 'multilingual', 'poi_map', 'tours', 'events', 'analytics', 'api', 'custom_branding'],
    commonObjections: ['public_tender', 'security_audit', 'existing_contracts', 'political_process'],
  },
  region: {
    id: 'region',
    label: 'Region / Tourismusverband',
    description: 'Regionale Tourismusverbaende, Landkreise, Ferienregionen',
    icon: 'map',
    typicalPoiCount: [200, 2_000],
    typicalLanguages: [3, 10],
    typicalMonthlyVisitors: [50_000, 500_000],
    recommendedTier: 'enterprise',
    salesCycleWeeks: [8, 20],
    keyFeatures: ['region_guide', 'multilingual', 'sub_entities', 'tours', 'events', 'analytics', 'partner_portal'],
    commonObjections: ['coordination_complexity', 'data_ownership', 'existing_systems', 'political_decision'],
  },
  hotel: {
    id: 'hotel',
    label: 'Hotel / Unterkunft',
    description: 'Hotels, Pensionen, Ferienwohnungen mit Gaesteinformation',
    icon: 'bed',
    typicalPoiCount: [10, 50],
    typicalLanguages: [2, 6],
    typicalMonthlyVisitors: [500, 10_000],
    recommendedTier: 'starter',
    salesCycleWeeks: [1, 3],
    keyFeatures: ['guest_info', 'multilingual', 'local_tips', 'booking_integration'],
    commonObjections: ['budget', 'guest_adoption', 'existing_info_folder'],
  },
  resort: {
    id: 'resort',
    label: 'Resort / Ferienanlage',
    description: 'Grosse Ferienanlagen, Freizeitparks, Wellness-Resorts',
    icon: 'palmtree',
    typicalPoiCount: [50, 300],
    typicalLanguages: [3, 10],
    typicalMonthlyVisitors: [5_000, 100_000],
    recommendedTier: 'professional',
    salesCycleWeeks: [3, 8],
    keyFeatures: ['resort_guide', 'multilingual', 'activity_booking', 'dining', 'notifications'],
    commonObjections: ['integration', 'existing_app', 'branding'],
  },
  cruise: {
    id: 'cruise',
    label: 'Kreuzfahrt',
    description: 'Kreuzfahrtschiffe und Flusskreuzfahrten',
    icon: 'ship',
    typicalPoiCount: [50, 200],
    typicalLanguages: [5, 12],
    typicalMonthlyVisitors: [2_000, 50_000],
    recommendedTier: 'professional',
    salesCycleWeeks: [6, 16],
    keyFeatures: ['ship_guide', 'multilingual', 'shore_excursions', 'onboard_activities', 'offline_mode'],
    commonObjections: ['connectivity', 'existing_app', 'fleet_rollout'],
  },
  event: {
    id: 'event',
    label: 'Event / Messe',
    description: 'Messen, Festivals, Konferenzen, temporaere Veranstaltungen',
    icon: 'calendar',
    typicalPoiCount: [20, 500],
    typicalLanguages: [2, 8],
    typicalMonthlyVisitors: [5_000, 200_000],
    recommendedTier: 'professional',
    salesCycleWeeks: [2, 6],
    keyFeatures: ['event_guide', 'multilingual', 'schedule', 'exhibitor_info', 'notifications'],
    commonObjections: ['short_timeline', 'temporary_use', 'budget_justification'],
  },
  partner: {
    id: 'partner',
    label: 'Partner / Agentur',
    description: 'Reisebueros, Tourismusagenturen, Technologiepartner',
    icon: 'handshake',
    typicalPoiCount: [0, 0],
    typicalLanguages: [2, 5],
    typicalMonthlyVisitors: [0, 0],
    recommendedTier: 'partner',
    salesCycleWeeks: [2, 8],
    keyFeatures: ['white_label', 'api', 'revenue_share', 'partner_portal'],
    commonObjections: ['margin', 'exclusivity', 'technical_requirements'],
  },
  enterprise: {
    id: 'enterprise',
    label: 'Enterprise',
    description: 'Grosse Organisationen mit individuellen Anforderungen',
    icon: 'building',
    typicalPoiCount: [100, 10_000],
    typicalLanguages: [5, 30],
    typicalMonthlyVisitors: [100_000, 5_000_000],
    recommendedTier: 'enterprise',
    salesCycleWeeks: [12, 36],
    keyFeatures: ['full_platform', 'api', 'sso', 'custom_development', 'sla', 'dedicated_support'],
    commonObjections: ['security_audit', 'compliance', 'procurement_process', 'existing_contracts'],
  },
  other: {
    id: 'other',
    label: 'Sonstige',
    description: 'Andere Zielgruppen und Sonderfaelle',
    icon: 'help-circle',
    typicalPoiCount: [1, 1_000],
    typicalLanguages: [1, 10],
    typicalMonthlyVisitors: [0, 100_000],
    recommendedTier: 'starter',
    salesCycleWeeks: [1, 12],
    keyFeatures: ['multilingual', 'ai_chat'],
    commonObjections: [],
  },
}

// ============================================================================
// Dashboard / Stats Types (match fw_get_sales_dashboard return)
// ============================================================================

export interface PipelineStats {
  segment: CrmSegmentId
  status: LeadStatus
  leadCount: number
  totalPipelineValue: number
}

export interface SegmentDashboardStats {
  total: number
  won: number
  lost: number
  active: number
  pipelineValue: number
}

export interface SalesDashboard {
  totalLeads: number
  activeLeads: number
  totalWon: number
  totalLost: number
  conversionRate: number
  avgDealValue: number
  pipelineValue: number
  wonValue: number
  overdueTasks: number
  bySegment: Partial<Record<CrmSegmentId, SegmentDashboardStats>>
}

// ============================================================================
// Helper: Score a lead for prioritization
// ============================================================================

export function scoreLeadPriority(lead: Pick<CrmLead, 'segmentId' | 'estimatedMonthlyVisitors' | 'budgetConfirmed' | 'decisionTimeline' | 'source'>): number {
  let score = 0

  // Segment weight
  const segmentWeights: Partial<Record<CrmSegmentId, number>> = {
    enterprise: 30,
    city_large: 25,
    region: 25,
    museum_large: 20,
    city_medium: 15,
    cruise: 15,
    resort: 12,
    museum_medium: 10,
    event: 10,
    partner: 10,
    city_small: 8,
    hotel: 5,
    museum_small: 5,
    other: 2,
  }
  score += segmentWeights[lead.segmentId] ?? 5

  // Visitor volume
  if (lead.estimatedMonthlyVisitors) {
    if (lead.estimatedMonthlyVisitors >= 100_000) score += 20
    else if (lead.estimatedMonthlyVisitors >= 30_000) score += 15
    else if (lead.estimatedMonthlyVisitors >= 5_000) score += 10
    else score += 5
  }

  // Budget confirmed
  if (lead.budgetConfirmed) score += 15

  // Timeline urgency
  const timelineWeights: Partial<Record<DecisionTimeline, number>> = {
    immediate: 20,
    '1_month': 15,
    '3_months': 10,
    '6_months': 5,
    next_year: 2,
  }
  if (lead.decisionTimeline) {
    score += timelineWeights[lead.decisionTimeline] ?? 0
  }

  // Source quality
  const sourceWeights: Partial<Record<LeadSource, number>> = {
    referral: 10,
    inbound: 8,
    event: 7,
    partner: 7,
    website: 5,
    linkedin: 4,
    cold_outreach: 2,
    import: 1,
  }
  if (lead.source) {
    score += sourceWeights[lead.source] ?? 0
  }

  return Math.min(100, Math.max(0, score))
}
