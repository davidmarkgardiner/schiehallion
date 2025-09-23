'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'

type ChatRole = 'user' | 'assistant'

type ConciergeMessage = {
  id: string
  role: ChatRole
  content: string
  pending?: boolean
}

type DataSourceMode = 'general' | 'repo' | 'web'

type ModeOption = {
  value: DataSourceMode
  label: string
  description: string
}

const MODE_OPTIONS: ModeOption[] = [
  {
    value: 'general',
    label: 'Concierge',
    description: 'Answers using hospitality playbooks and saved briefs.',
  },
  {
    value: 'repo',
    label: 'Docs',
    description: 'Searches the repository for implementation details.',
  },
  {
    value: 'web',
    label: 'Research',
    description: 'Enriches replies with live web search summaries.',
  },
]

const INITIAL_MESSAGE: ConciergeMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Hello from the Schiehallion concierge desk. Ask about rooms, dining, local adventures, or how this platform works — I can even peek at the codebase or fetch fresh web research when you need it.',
}

function buildTranscript(messages: ConciergeMessage[]) {
  return messages
    .filter((message) => !message.pending)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }))
}

function createContextSummary(context: { repo?: boolean; web?: boolean } | null) {
  if (!context) return undefined
  const parts = [
    context.repo ? 'Repository context included' : null,
    context.web ? 'Web search context included' : null,
  ].filter(Boolean)

  return parts.length ? parts.join(' · ') : undefined
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<DataSourceMode>('general')
  const [messages, setMessages] = useState<ConciergeMessage[]>([INITIAL_MESSAGE])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contextUsed, setContextUsed] = useState<{ repo?: boolean; web?: boolean } | null>(null)

  const [issueOpen, setIssueOpen] = useState(false)
  const [issueTitle, setIssueTitle] = useState('')
  const [issueDescription, setIssueDescription] = useState('')
  const [issueSeverity, setIssueSeverity] = useState<'low' | 'medium' | 'high'>('medium')
  const [issueCategory, setIssueCategory] = useState<'bug' | 'feedback' | 'feature'>('feedback')
  const [issueStatus, setIssueStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [issueError, setIssueError] = useState<string | null>(null)
  const [issueUrl, setIssueUrl] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      const frame = requestAnimationFrame(() => {
        inputRef.current?.focus()
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
      })
      return () => cancelAnimationFrame(frame)
    }
    return undefined
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const container = scrollRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [messages, isOpen])

  const lastUserMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === 'user' && !message.pending),
    [messages],
  )

  useEffect(() => {
    if (issueOpen && lastUserMessage && !issueDescription) {
      setIssueDescription(lastUserMessage.content)
    }
  }, [issueOpen, lastUserMessage, issueDescription])

  const handleSend = async () => {
    const trimmed = inputValue.trim()
    if (!trimmed || isLoading) {
      return
    }

    const userMessage: ConciergeMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
    }

    const pendingId = `pending-${Date.now()}`
    const history = buildTranscript(messages)

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: pendingId, role: 'assistant', content: '…', pending: true },
    ])
    setInputValue('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history, { role: 'user', content: trimmed }],
          mode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(typeof data?.error === 'string' ? data.error : 'Unable to contact the concierge right now.')
      }

      setMessages((prev) =>
        prev.map((message) =>
          message.id === pendingId
            ? {
                id: pendingId,
                role: 'assistant',
                content: typeof data?.message === 'string'
                  ? data.message.trim()
                  : 'I could not find an answer, please try again in a moment.',
              }
            : message,
        ),
      )
      setContextUsed(data?.context ?? null)
    } catch (err) {
      setMessages((prev) => prev.filter((message) => message.id !== pendingId))
      setError(err instanceof Error ? err.message : 'Unexpected error while sending your message.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void handleSend()
  }

  const toggleWidget = () => {
    setIsOpen((prev) => !prev)
    setIssueOpen(false)
  }

  const toggleIssueForm = () => {
    setIssueOpen((prev) => {
      const next = !prev
      if (next) {
        setIssueStatus('idle')
        setIssueError(null)
        setIssueUrl(null)
      }
      return next
    })
  }

  const submitIssue = async (event: FormEvent) => {
    event.preventDefault()

    if (!issueTitle.trim() || !issueDescription.trim()) {
      setIssueError('Title and description are required.')
      setIssueStatus('error')
      return
    }

    setIssueStatus('submitting')
    setIssueError(null)

    try {
      const transcript = buildTranscript(messages)
      const metadata: Record<string, unknown> = {
        chatTranscript: transcript,
      }

      if (typeof window !== 'undefined') {
        metadata.url = window.location.href
      }

      if (typeof navigator !== 'undefined') {
        metadata.browser = navigator.userAgent
      }

      const contextSummary = createContextSummary(contextUsed)
      if (contextSummary) {
        metadata.additionalContext = contextSummary
      }

      const response = await fetch('/api/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: issueTitle.trim(),
          description: issueDescription.trim(),
          severity: issueSeverity,
          category: issueCategory,
          metadata,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(typeof data?.error === 'string' ? data.error : 'Issue reporting failed. Check configuration.')
      }

      setIssueStatus('success')
      setIssueUrl(typeof data?.issueUrl === 'string' ? data.issueUrl : null)
      setIssueTitle('')
      setIssueDescription('')
    } catch (err) {
      setIssueStatus('error')
      setIssueError(err instanceof Error ? err.message : 'Unexpected error while creating the issue.')
    }
  }

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 text-lundies-charcoal">
      <button
        type="button"
        onClick={toggleWidget}
        className="pointer-events-auto flex items-center gap-3 rounded-full bg-lundies-heather px-5 py-3 font-semibold text-lundies-charcoal shadow-xl shadow-lundies-heather/40 transition hover:bg-lundies-heather/80"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/70 text-lundies-charcoal">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3h6m-8.25 7.5 3.89-3.89c.27-.27.64-.42 1.02-.42h7.84a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 18 4.5H6A2.25 2.25 0 0 0 3.75 6.75v7.5A2.25 2.25 0 0 0 6 16.5h.75"
            />
          </svg>
        </span>
        <span>{isOpen ? 'Close concierge' : 'Ask the concierge'}</span>
      </button>

      {isOpen && (
        <div className="pointer-events-auto w-full max-w-md overflow-hidden rounded-3xl border border-lundies-stone/60 bg-white/95 shadow-2xl shadow-lundies-stone/50 backdrop-blur-xl">
          <div className="border-b border-lundies-stone/60 bg-gradient-to-r from-lundies-heather/30 via-transparent to-lundies-sand/30 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-lundies-moss/80">Virtual concierge</p>
                <h2 className="text-lg font-semibold text-lundies-charcoal">How can I help?</h2>
              </div>
              <button
                type="button"
                onClick={toggleWidget}
                className="rounded-full p-2 text-lundies-charcoal transition hover:bg-lundies-stone/30"
                aria-label="Close concierge"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 18 12-12M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-lundies-peat">
              {MODE_OPTIONS.map((option) => {
                const isActive = option.value === mode
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMode(option.value)}
                    className={`rounded-xl border px-2 py-2 text-left transition ${
                      isActive
                        ? 'border-lundies-heather bg-lundies-heather/30 text-lundies-charcoal'
                        : 'border-lundies-stone/60 bg-white/70 text-lundies-peat hover:border-lundies-heather/60 hover:text-lundies-charcoal'
                    }`}
                  >
                    <span className="block text-[11px] font-semibold uppercase tracking-wide">{option.label}</span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-lundies-peat/80">
                      {option.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex max-h-96 flex-col">
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-lundies-linen px-5 py-4 text-sm text-lundies-charcoal">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-lg ${
                      message.role === 'user'
                        ? 'bg-lundies-heather text-lundies-charcoal shadow-lundies-heather/30'
                        : 'border border-lundies-stone/60 bg-white text-lundies-peat shadow-lundies-stone/30'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              {contextUsed && (
                <div className="mt-4 text-[11px] uppercase tracking-wide text-lundies-moss">
                  Context: {createContextSummary(contextUsed) ?? 'General knowledge'}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-lundies-stone/60 bg-white/90 p-4">
              <label htmlFor="concierge-input" className="sr-only">
                Ask the concierge a question
              </label>
              <div className="rounded-2xl border border-lundies-stone/60 bg-white/90">
                <textarea
                  id="concierge-input"
                  ref={inputRef}
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void handleSend()
                    }
                  }}
                  placeholder="Ask about availability, restaurant concepts, or the technical stack…"
                  rows={3}
                  className="w-full resize-none rounded-2xl bg-transparent px-4 py-3 text-sm text-lundies-charcoal outline-none"
                />
                <div className="flex items-center justify-between border-t border-lundies-stone/60 px-4 py-2">
                  <div className="text-xs text-lundies-peat">
                    {error ? <span className="text-rose-500">{error}</span> : 'Shift + Enter for a new line'}
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !inputValue.trim()}
                    className="flex items-center gap-2 rounded-full bg-lundies-heather px-4 py-1.5 text-sm font-semibold text-lundies-charcoal transition hover:bg-lundies-heather/80 disabled:cursor-not-allowed disabled:bg-lundies-heather/50"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 14-8-4 8 4 8z" />
                    </svg>
                    {isLoading ? 'Sending…' : 'Send'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="border-t border-lundies-stone/60 bg-lundies-linen px-5 py-4 text-xs text-lundies-charcoal">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleIssueForm}
                className="rounded-full border border-lundies-heather/60 px-3 py-1.5 font-semibold text-lundies-moss transition hover:bg-lundies-heather/20"
              >
                {issueOpen ? 'Hide issue form' : 'Report an issue'}
              </button>
              <span className="text-[11px] text-lundies-peat">
                Conversations may be attached to GitHub issues for follow-up.
              </span>
            </div>

            {issueOpen && (
              <form onSubmit={submitIssue} className="mt-4 space-y-3 rounded-2xl border border-lundies-stone/60 bg-white/90 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="issue-title" className="text-[11px] font-semibold uppercase tracking-wide text-lundies-moss">
                      Issue title
                    </label>
                    <input
                      id="issue-title"
                      value={issueTitle}
                      onChange={(event) => setIssueTitle(event.target.value)}
                      placeholder="Summarise the feedback"
                      className="w-full rounded-xl border border-lundies-stone/60 bg-white px-3 py-2 text-sm text-lundies-charcoal focus:border-lundies-heather focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="issue-severity" className="text-[11px] font-semibold uppercase tracking-wide text-lundies-moss">
                        Severity
                      </label>
                      <select
                        id="issue-severity"
                        value={issueSeverity}
                        onChange={(event) => setIssueSeverity(event.target.value as 'low' | 'medium' | 'high')}
                        className="w-full rounded-xl border border-lundies-stone/60 bg-white px-3 py-2 text-sm text-lundies-charcoal focus:border-lundies-heather focus:outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="issue-category" className="text-[11px] font-semibold uppercase tracking-wide text-lundies-moss">
                        Category
                      </label>
                      <select
                        id="issue-category"
                        value={issueCategory}
                        onChange={(event) => setIssueCategory(event.target.value as 'bug' | 'feedback' | 'feature')}
                        className="w-full rounded-xl border border-lundies-stone/60 bg-white px-3 py-2 text-sm text-lundies-charcoal focus:border-lundies-heather focus:outline-none"
                      >
                        <option value="bug">Bug</option>
                        <option value="feedback">Feedback</option>
                        <option value="feature">Feature</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="issue-description" className="text-[11px] font-semibold uppercase tracking-wide text-lundies-moss">
                    Description
                  </label>
                  <textarea
                    id="issue-description"
                    value={issueDescription}
                    onChange={(event) => setIssueDescription(event.target.value)}
                    placeholder="Share the details we should capture in GitHub."
                    rows={3}
                    className="w-full rounded-xl border border-lundies-stone/60 bg-white px-3 py-2 text-sm text-lundies-charcoal focus:border-lundies-heather focus:outline-none"
                  />
                </div>
                {issueStatus === 'success' && (
                  <div className="rounded-xl border border-lundies-heather/60 bg-lundies-heather/20 px-3 py-2 text-lundies-charcoal">
                    Issue created successfully.
                    {issueUrl && (
                      <a
                        href={issueUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 underline"
                      >
                        View issue
                      </a>
                    )}
                  </div>
                )}
                {issueError && (
                  <div className="rounded-xl border border-rose-400 bg-rose-100 px-3 py-2 text-rose-700">
                    {issueError}
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-lundies-peat">
                  <span>Transcript is attached automatically for engineers.</span>
                  <button
                    type="submit"
                    disabled={issueStatus === 'submitting'}
                    className="rounded-full bg-lundies-heather px-4 py-1.5 text-xs font-semibold text-lundies-charcoal transition hover:bg-lundies-heather/80 disabled:cursor-not-allowed disabled:bg-lundies-heather/50"
                  >
                    {issueStatus === 'submitting' ? 'Sending…' : 'Submit issue'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
