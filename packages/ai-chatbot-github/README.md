# AI Chatbot with GitHub Integration

A reusable Node.js chatbot package that provides LLM-powered conversations with GitHub issue creation and user feedback capabilities.

## Features

- **Multi-Provider LLM Support**: OpenAI and Anthropic Claude
- **Repository Context**: Search and include repository files in conversations
- **Web Search**: Integrate DuckDuckGo search results
- **GitHub Issue Creation**: Automatically create GitHub issues from user feedback
- **AI-Enhanced Issues**: Use LLM to expand simple user feedback into structured GitHub issues

## Installation

1. Copy the `packages/ai-chatbot-github` folder to your project.
2. Ensure your runtime supports the Fetch API (Node.js 18+ or Next.js 14/15) for outbound API calls.

## Environment Variables

```env
# LLM Providers (at least one required)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Models (optional - uses defaults if not set)
OPENAI_MODEL=gpt-4o-mini
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# GitHub Integration (required for issue creation)
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_username_or_org
GITHUB_REPO=your_repository_name
```

## Usage

### Basic Chat API

```typescript
// pages/api/chat.ts or app/api/chat/route.ts
import { ChatRequestBody, handleChatRequest } from './packages/ai-chatbot-github'

export async function POST(request: Request) {
  return handleChatRequest(request)
}
```

### GitHub Issue Creation API

```typescript
// pages/api/report-issue.ts or app/api/report-issue/route.ts
import { IssueReportRequest, handleIssueReport } from './packages/ai-chatbot-github'

export async function POST(request: Request) {
  return handleIssueReport(request)
}
```

### Frontend Usage

```typescript
// Chat functionality
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: 'How do I deploy this application?' }
    ],
    mode: 'repo', // 'general', 'repo', or 'web'
    provider: 'openai' // optional, will auto-select if not specified
  })
})

const data = await response.json()
console.log(data.message) // AI response
console.log(data.context) // Whether repo/web context was used

// Issue creation
const issueResponse = await fetch('/api/report-issue', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Bug Report',
    description: 'The app crashes when I click the submit button',
    severity: 'medium',
    category: 'bug',
    metadata: {
      url: window.location.href,
      browser: navigator.userAgent,
      additionalContext: 'Happens on mobile Safari'
    }
  })
})

const issueData = await issueResponse.json()
console.log(issueData.issueUrl) // Link to created GitHub issue
```

## API Reference

### Chat Request

```typescript
interface ChatRequestBody {
  messages: { role: string; content: string }[]
  mode?: 'general' | 'repo' | 'web'
  provider?: 'openai' | 'anthropic'
}
```

### Issue Report Request

```typescript
interface IssueReportRequest {
  title: string
  description: string
  severity?: 'low' | 'medium' | 'high'
  category?: 'bug' | 'feedback' | 'feature'
  metadata?: {
    url?: string
    chatTranscript?: ChatMessage[]
    browser?: string
    additionalContext?: string
  }
}
```

## Customization

### Repository Search Paths

Modify `SEARCH_ROOTS` in `repository.ts` to customize which files/folders are searched for context:

```typescript
const SEARCH_ROOTS = [
  'README.md',
  'docs',
  path.join('src', 'app'),
  path.join('src', 'components'),
  // Add your custom paths
]
```

### System Prompt

Customize the AI personality in the chat handler:

```typescript
const augmentedMessages: ChatMessage[] = [
  {
    role: 'system',
    content: 'You are [Your App Name]\'s AI assistant. [Custom instructions]'
  }
]
```

### Issue Templates

Modify the AI prompt in `expandUserFeedback()` function to customize how issues are structured.

## Examples

### Hotel/Restaurant Use Case

For your hotel and restaurant application, you could customize the system prompt:

```typescript
const systemPrompt = 'You are the AI assistant for [Hotel Name]. Help guests with room bookings, restaurant reservations, amenities information, and local recommendations. Be friendly and professional.'
```

And create custom issue categories:

```typescript
// Custom categories for hotel/restaurant
category?: 'room-issue' | 'restaurant-feedback' | 'booking-problem' | 'amenity-request' | 'general-feedback'
```

## License

MIT License