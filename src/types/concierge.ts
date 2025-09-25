export type SupportedLanguage = 'en' | 'fr' | 'de' | 'es' | 'gd'

export interface ConciergeMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  details?: string[]
  actions?: ConciergeAction[]
  followUps?: string[]
  timestamp: number
}

export interface ConciergeAction {
  label: string
  url: string
}

export interface ConciergeQuickReply {
  id: string
  label: string
  prompt: string
}

export type ConciergeIntent = 'welcome' | 'attractions' | 'booking' | 'restaurant' | 'general'

export interface ConciergeContext {
  language: SupportedLanguage
  lastIntent?: ConciergeIntent
  lastStaySummary?: {
    checkIn: string
    checkOut: string
    nights: number
    guests?: number
  }
  lastCuisineFocus?: string
  lastAttractionInterests?: string[]
}

export interface ConciergeReply {
  message: string
  details?: string[]
  actions?: ConciergeAction[]
  followUps?: string[]
  quickReplies?: ConciergeQuickReply[]
  contextUpdates?: Partial<ConciergeContext>
}
