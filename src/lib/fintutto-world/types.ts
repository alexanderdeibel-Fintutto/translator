// Fintutto World — Core Type Definitions
// Shared across all domains: Museums, Cities, Regions, Cruises, Events
// These types enable the universal personalized experience

// ============================================================================
// Universal Visitor Profile
// ============================================================================

export type AgeGroup = 'child' | 'youth' | 'young_adult' | 'adult' | 'senior'
export type KnowledgeLevel = 'beginner' | 'casual' | 'enthusiast' | 'expert' | 'professional'
export type ContentStyle = 'factual' | 'narrative' | 'storytelling' | 'academic'
export type AiTone = 'formal' | 'warm' | 'casual' | 'enthusiastic' | 'academic'
export type AiDetailLevel = 'minimal' | 'standard' | 'detailed' | 'exhaustive'
export type VoiceGender = 'male' | 'female' | 'neutral'
export type VoiceAge = 'child' | 'young' | 'middle' | 'mature'
export type BudgetLevel = 'budget' | 'medium' | 'premium' | 'luxury'
export type MobilityLevel = 'full' | 'limited' | 'wheelchair' | 'stroller'
export type TravelMode = 'resident' | 'day_trip' | 'weekend' | 'vacation' | 'long_stay'
export type GroupSize = 'solo' | 'couple' | 'small_group' | 'family' | 'large_group'
export type ContextType = 'museum' | 'city' | 'region' | 'cruise' | 'event' | 'nature' | 'general'
export type DialogMode = 'reactive' | 'proactive' | 'guided'
export type QuestionFrequency = 'never' | 'rare' | 'moderate' | 'frequent'

export interface UniversalVisitorProfile {
  id: string
  userId: string | null

  // Identity
  displayName: string | null
  preferredSalutation: string | null
  avatarUrl: string | null

  // Demographics
  ageGroup: AgeGroup
  birthYear: number | null
  gender: string | null
  countryOfOrigin: string | null
  countryOfResidence: string | null

  // Language
  primaryLanguage: string
  secondaryLanguages: string[]
  uiLanguage: string

  // Knowledge & Interests
  knowledgeLevel: KnowledgeLevel
  interests: string[]
  favoriteCategories: string[]
  favoriteEpochs: string[]
  favoriteArtists: string[]
  dietaryPreferences: string[]
  budgetLevel: BudgetLevel
  mobilityLevel: MobilityLevel
  accessibilityNeeds: string[]

  // Visit Style
  preferredTourDepth: 'quick' | 'standard' | 'deep_dive'
  preferredContentStyle: ContentStyle
  preferredGroupSize: GroupSize
  typicalVisitDurationMinutes: number | null
  prefersIndoor: boolean
  prefersOutdoor: boolean

  // Voice & Audio
  preferredVoiceGender: VoiceGender
  preferredVoiceAge: VoiceAge
  preferredVoicePreset: string | null
  audioSpeed: number
  autoPlayAudio: boolean

  // AI Personality
  aiPersonalityTone: AiTone
  aiDetailLevel: AiDetailLevel
  aiIncludeAnecdotes: boolean
  aiIncludeComparisons: boolean
  aiIncludeTechnique: boolean
  aiChildMode: boolean
  aiProactiveSuggestions: boolean
  aiQuestionFrequency: QuestionFrequency

  // Notification Preferences
  notificationsEnabled: boolean
  notifyNearbyPois: boolean
  notifyNearbyOffers: boolean
  notifyTimeWarnings: boolean
  notifyRecommendations: boolean
  notificationRadiusMeters: number
  notificationCooldownMinutes: number

  // Current Context (ephemeral)
  currentLat: number | null
  currentLng: number | null
  currentContextType: ContextType | null
  currentContextId: string | null

  // Travel Context
  travelMode: TravelMode | null
  travelStartDate: string | null
  travelEndDate: string | null
  travelPartySize: number
  travelWithChildren: boolean
  travelChildrenAges: number[]

  // Meta
  onboardingCompleted: boolean
  totalVisits: number
  totalPoisViewed: number
  totalAiConversations: number
  lastActiveAt: string
}

// ============================================================================
// AI Dialog
// ============================================================================

export interface DialogMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    poiId?: string
    poiName?: string
    language?: string
    actionSuggested?: string
    tokensUsed?: number
  }
}

export interface AiDialog {
  id: string
  visitorId: string
  contextType: ContextType
  contextId: string | null
  contextName: string | null
  parentType: ContextType | null
  parentId: string | null
  messages: DialogMessage[]
  totalMessages: number
  personalizationSnapshot: UniversalPersonalizationContext
  status: 'active' | 'paused' | 'completed' | 'archived'
  dialogMode: DialogMode
  startedAt: string
  lastMessageAt: string
}

// ============================================================================
// Personalization Context (sent to AI for every request)
// ============================================================================

export interface UniversalPersonalizationContext {
  // Visitor identity
  ageGroup: AgeGroup
  knowledgeLevel: KnowledgeLevel
  preferredSalutation: string | null
  contentStyle: ContentStyle
  tourDepth: 'quick' | 'standard' | 'deep_dive'
  language: string
  secondaryLanguages: string[]

  // AI behavior
  aiTone: AiTone
  aiDetailLevel: AiDetailLevel
  includeAnecdotes: boolean
  includeComparisons: boolean
  includeTechnique: boolean
  childMode: boolean
  proactiveSuggestions: boolean
  questionFrequency: QuestionFrequency

  // Accessibility
  accessibilityNeeds: string[]

  // Voice
  voiceGender: VoiceGender
  voiceAge: VoiceAge
  voicePreset: string | null
  audioSpeed: number

  // Lifestyle
  dietaryPreferences: string[]
  budgetLevel: BudgetLevel
  mobilityLevel: MobilityLevel
  groupSize: GroupSize
  interests: string[]

  // Travel
  travelMode: TravelMode | null
  travelPartySize: number
  travelWithChildren: boolean

  // Preferences
  prefersIndoor: boolean
  prefersOutdoor: boolean
  notificationsEnabled: boolean
  notificationRadiusMeters: number
}

/** Build a personalization context from a visitor profile */
export function buildUniversalPersonalizationContext(
  profile: UniversalVisitorProfile,
): UniversalPersonalizationContext {
  return {
    ageGroup: profile.ageGroup,
    knowledgeLevel: profile.knowledgeLevel,
    preferredSalutation: profile.preferredSalutation,
    contentStyle: profile.preferredContentStyle,
    tourDepth: profile.preferredTourDepth,
    language: profile.primaryLanguage,
    secondaryLanguages: profile.secondaryLanguages,
    aiTone: profile.aiPersonalityTone,
    aiDetailLevel: profile.aiDetailLevel,
    includeAnecdotes: profile.aiIncludeAnecdotes,
    includeComparisons: profile.aiIncludeComparisons,
    includeTechnique: profile.aiIncludeTechnique,
    childMode: profile.aiChildMode,
    proactiveSuggestions: profile.aiProactiveSuggestions,
    questionFrequency: profile.aiQuestionFrequency,
    accessibilityNeeds: profile.accessibilityNeeds,
    voiceGender: profile.preferredVoiceGender,
    voiceAge: profile.preferredVoiceAge,
    voicePreset: profile.preferredVoicePreset,
    audioSpeed: profile.audioSpeed,
    dietaryPreferences: profile.dietaryPreferences,
    budgetLevel: profile.budgetLevel,
    mobilityLevel: profile.mobilityLevel,
    groupSize: profile.preferredGroupSize,
    interests: profile.interests,
    travelMode: profile.travelMode,
    travelPartySize: profile.travelPartySize,
    travelWithChildren: profile.travelWithChildren,
    prefersIndoor: profile.prefersIndoor,
    prefersOutdoor: profile.prefersOutdoor,
    notificationsEnabled: profile.notificationsEnabled,
    notificationRadiusMeters: profile.notificationRadiusMeters,
  }
}

// ============================================================================
// Universal POI (works for any content type)
// ============================================================================

export type MultilingualText = Record<string, string>

export interface UniversalPoi {
  id: string
  poiType: string            // artwork, poi, restaurant, hotel, ship_area, trail_point, ...
  name: MultilingualText
  description: MultilingualText
  shortDescription: MultilingualText
  lat: number | null
  lng: number | null
  coverImageUrl: string | null
  gallery: string[]
  tags: string[]
  // Parent
  parentType: ContextType
  parentId: string
  parentName: string
  // Content layers
  contentLayers: {
    brief: MultilingualText
    standard: MultilingualText
    detailed: MultilingualText
    children: MultilingualText
    youth: MultilingualText
    funFacts: MultilingualText
    historicalContext: MultilingualText
    techniqueDetails: MultilingualText
  }
  // AI
  aiNarration: MultilingualText
  aiBaseKnowledge: Record<string, unknown> | null
}

// ============================================================================
// Visit & Interaction Records
// ============================================================================

export interface VisitRecord {
  id: string
  visitorId: string
  contextType: ContextType
  contextId: string
  contextName: string | null
  parentType: ContextType | null
  parentId: string | null
  startedAt: string
  endedAt: string | null
  durationMinutes: number | null
  itemsViewed: number
  audioPlays: number
  aiConversations: number
  rating: number | null
  tourId: string | null
  tourCompleted: boolean
}

export interface PoiInteraction {
  id: string
  visitorId: string
  visitId: string | null
  poiType: string
  poiId: string
  poiName: string | null
  interactionType: 'view' | 'audio_play' | 'ai_chat' | 'favorite' | 'share' | 'book' | 'rate' | 'photo'
  viewedAt: string
  durationSeconds: number | null
  detectionMethod: string
  languageUsed: string | null
  audioPlayed: boolean
  aiChatStarted: boolean
  aiMessagesCount: number
  rating: number | null
  favorited: boolean
}
