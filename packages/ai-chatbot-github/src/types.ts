export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  role: ChatRole
  content: string
  timestamp?: number
}

export type ChatDataSource = 'general' | 'repo' | 'web'
export type ChatProvider = 'openai' | 'anthropic'

export interface ChatRequestBody {
  messages: { role: string; content: string }[]
  mode?: ChatDataSource
  provider?: ChatProvider
}

export interface ProviderOptions {
  model?: string
  temperature?: number
  maxOutputTokens?: number
}

export interface ProviderResponse {
  role: 'assistant'
  content: string
  provider: ChatProvider
}

export interface IssueReportMetadata {
  url?: string
  chatTranscript?: ChatMessage[]
  browser?: string
  additionalContext?: string
}

export interface IssueReportRequest {
  title: string
  description: string
  severity?: 'low' | 'medium' | 'high'
  category?: 'bug' | 'feedback' | 'feature'
  metadata?: IssueReportMetadata
}