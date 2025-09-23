import { NextRequest, NextResponse } from 'next/server'
import type { IssueReportRequest, IssueReportMetadata } from './types'

async function requestOpenAICompletion(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return null
  }

  const payload = {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a technical issue analyst who expands user reports into actionable GitHub issues with clear structure.',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1000,
    temperature: 0.3,
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`OpenAI request failed: ${errorText}`)
  }

  const data = await response.json()
  const expandedContent = data?.choices?.[0]?.message?.content

  return typeof expandedContent === 'string' ? expandedContent : null
}

async function createGitHubIssue({
  owner,
  repo,
  token,
  title,
  body,
  labels,
}: {
  owner: string
  repo: string
  token: string
  title: string
  body: string
  labels?: string[]
}) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues`
  const payload: Record<string, unknown> = {
    title,
    body,
  }

  if (labels && labels.length) {
    payload.labels = labels
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'User-Agent': 'ai-chatbot-github',
    },
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (!response.ok) {
    const message = typeof data?.message === 'string' ? data.message : 'GitHub issue creation failed.'
    throw new Error(message)
  }

  return data as { number: number; html_url: string }
}

// Enhanced issue template with AI expansion
async function expandUserFeedback(userPrompt: string, conversationId?: string, userAgent?: string) {
  try {
    // Check if OpenAI is available
    const prompt = `A user reported a problem with our application. Expand their feedback into a GitHub issue with these sections:

## Problem Summary
[Clear, concise summary of the issue]

## Steps to Reproduce
[Numbered steps to replicate]

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Additional Context
[Technical details, error messages, environment info]

## Priority Assessment
[Low/Medium/High with justification]

## Suggested Solution Approach
[Brief implementation considerations]

User's original feedback: "${userPrompt}"`

    const expandedContent = await requestOpenAICompletion(prompt)

    if (!expandedContent) {
      console.log('OpenAI not available, using structured template fallback')
      return createStructuredIssue(userPrompt, conversationId, userAgent)
    }

    // Add metadata section
    const metadata = [
      "---",
      "**🤖 AI-Generated Issue Report**",
      `**Conversation ID:** ${conversationId || 'N/A'}`,
      `**User Agent:** ${userAgent || 'N/A'}`,
      `**Generated:** ${new Date().toISOString()}`,
      "",
      "*This issue was automatically expanded from user feedback using AI to provide more structure and detail.*"
    ].join('\n')

    return `${expandedContent}\n\n${metadata}`
  } catch (error) {
    console.error('AI expansion failed:', error)
    // Fallback to structured template if AI fails
    return createStructuredIssue(userPrompt, conversationId, userAgent)
  }
}

// Fallback structured issue creation when AI is not available
function createStructuredIssue(userPrompt: string, conversationId?: string, userAgent?: string) {
  const structuredIssue = [
    "## Problem Summary",
    userPrompt,
    "",
    "## Steps to Reproduce",
    "_To be determined - more information needed from user_",
    "",
    "## Expected Behavior",
    "_To be determined - user feedback needs clarification_",
    "",
    "## Actual Behavior",
    "_Based on user description above_",
    "",
    "## Additional Context",
    "_No additional technical details provided yet_",
    "",
    "## Priority Assessment",
    "_Needs triage and evaluation_",
    "",
    "## Next Steps",
    "- [ ] Gather more specific details from user",
    "- [ ] Reproduce the issue",
    "- [ ] Assign priority level",
    "- [ ] Plan implementation approach",
    "",
    "---",
    "**📝 Structured Issue Report**",
    `**Conversation ID:** ${conversationId || 'N/A'}`,
    `**User Agent:** ${userAgent || 'N/A'}`,
    `**Generated:** ${new Date().toISOString()}`,
    "",
    "*This issue was created from user feedback using a structured template. AI enhancement was not available.*"
  ].join('\n')

  return structuredIssue
}

function formatTranscript(transcript?: IssueReportMetadata['chatTranscript']) {
  if (!Array.isArray(transcript) || !transcript.length) {
    return null
  }

  const formatted = transcript
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join('\n')

  return `Chat transcript:\n${formatted}`
}

function buildIssueBody(payload: IssueReportRequest): string {
  const sections: string[] = []

  if (payload.description) {
    sections.push(payload.description.trim())
  }

  const metadataLines: string[] = []

  if (payload.severity) {
    metadataLines.push(`Severity: ${payload.severity}`)
  }

  if (payload.category) {
    metadataLines.push(`Category: ${payload.category}`)
  }

  const metadata = payload.metadata

  if (metadata?.url) {
    metadataLines.push(`Page: ${metadata.url}`)
  }

  if (metadata?.browser) {
    metadataLines.push(`Browser: ${metadata.browser}`)
  }

  if (metadata?.additionalContext) {
    metadataLines.push(`Additional context: ${metadata.additionalContext}`)
  }

  if (metadataLines.length) {
    sections.push(metadataLines.join('\n'))
  }

  const transcript = formatTranscript(metadata?.chatTranscript)
  if (transcript) {
    sections.push(transcript)
  }

  return sections.join('\n\n')
}

export async function handleIssueReport(request: NextRequest | Request) {
  try {
    const payload = (await request.json()) as IssueReportRequest

    if (!payload || !payload.title || !payload.description) {
      return NextResponse.json(
        { error: 'Title and description are required.' },
        { status: 400 }
      )
    }

    const token = process.env.GITHUB_TOKEN
    const repo = process.env.GITHUB_REPO
    const owner = process.env.GITHUB_OWNER

    if (!token || !repo || !owner) {
      return NextResponse.json(
        {
          error:
            'GitHub integration is not configured. Set GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO.',
        },
        { status: 500 }
      )
    }

    // Use AI enhancement if description is simple, otherwise use original format
    let issueBody: string
    const isSimpleDescription = payload.description && payload.description.trim().length < 200 && !payload.metadata?.chatTranscript

    if (isSimpleDescription) {
      // Use AI enhancement for simple user feedback
      const conversationId = crypto.randomUUID()
      const userAgent = payload.metadata?.browser || 'Unknown'
      issueBody = await expandUserFeedback(payload.description, conversationId, userAgent)
    } else {
      // Use original format for complex submissions
      issueBody = buildIssueBody(payload)
    }

    const issue = await createGitHubIssue({
      owner,
      repo,
      token,
      title: payload.title,
      body: issueBody,
      labels: isSimpleDescription
        ? ['user-feedback', 'ai-enhanced', 'needs-triage']
        : payload.category
          ? [payload.category]
          : undefined,
    })

    console.log(`✅ GitHub issue created: #${issue.number}`)

    return NextResponse.json({
      success: true,
      issueNumber: issue.number,
      issueUrl: issue.html_url,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}