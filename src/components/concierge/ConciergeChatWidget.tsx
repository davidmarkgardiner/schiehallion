'use client'

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import {
  getInputPlaceholder,
  getQuickReplyTemplates,
  getWelcomeMessages,
  processConciergeMessage,
} from '@/services/conciergeService'
import { languageLabels } from '@/lib/conciergeI18n'
import type {
  ConciergeContext,
  ConciergeMessage,
  ConciergeQuickReply,
  SupportedLanguage,
} from '@/types/concierge'

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr', 'de', 'es', 'gd']

function createMessage(partial: Omit<ConciergeMessage, 'id' | 'timestamp'>): ConciergeMessage {
  return {
    id: `${partial.role}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    timestamp: Date.now(),
    ...partial,
  }
}

export default function ConciergeChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [language, setLanguage] = useState<SupportedLanguage>('en')
  const [messages, setMessages] = useState<ConciergeMessage[]>([])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [context, setContext] = useState<ConciergeContext>({ language: 'en' })
  const [quickReplies, setQuickReplies] = useState<ConciergeQuickReply[]>(() => getQuickReplyTemplates('en'))
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const hasInitialisedRef = useRef(false)
  const previousLanguageRef = useRef<SupportedLanguage>('en')

  const inputPlaceholder = useMemo(() => getInputPlaceholder(language), [language])

  useEffect(() => {
    if (!hasInitialisedRef.current) {
      hasInitialisedRef.current = true
      const welcome = getWelcomeMessages(language)
      setMessages(welcome.map(text => createMessage({ role: 'assistant', content: text })))
    }
  }, [language])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isProcessing])

  useEffect(() => {
    setQuickReplies(getQuickReplyTemplates(language))
  }, [language])

  useEffect(() => {
    if (previousLanguageRef.current !== language) {
      previousLanguageRef.current = language
      setContext(prev => ({ ...prev, language }))
      const reminder = getWelcomeMessages(language).slice(-1)[0]
      setMessages(prev => [
        ...prev,
        createMessage({ role: 'assistant', content: `${languageLabels[language]} · ${reminder}` }),
      ])
    }
  }, [language])

  const toggleOpen = () => {
    setIsOpen(prev => !prev)
  }

  const handleSend = async (prompt: string) => {
    if (isProcessing) return
    const trimmed = prompt.trim()
    if (!trimmed) return

    const userMessage = createMessage({ role: 'user', content: trimmed })
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    try {
      const { reply, context: updatedContext } = await processConciergeMessage(trimmed, {
        language,
        context,
      })

      const assistantMessage = createMessage({
        role: 'assistant',
        content: reply.message,
        details: reply.details,
        actions: reply.actions,
        followUps: reply.followUps,
      })

      setMessages(prev => [...prev, assistantMessage])
      setContext(updatedContext)

      if (reply.quickReplies && reply.quickReplies.length) {
        setQuickReplies(reply.quickReplies)
      } else {
        setQuickReplies(getQuickReplyTemplates(language))
      }
    } catch (error) {
      console.error('Concierge assistant error', error)
      setMessages(prev => [
        ...prev,
        createMessage({
          role: 'assistant',
          content: 'I ran into a wee hiccup there. Could you try asking in another way?',
        }),
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSubmit = async () => {
    await handleSend(input)
  }

  const handleQuickReply = (reply: ConciergeQuickReply) => {
    setInput(reply.prompt)
    handleSend(reply.prompt)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[320px] sm:w-[360px] rounded-3xl border border-emerald-400/30 bg-slate-950/95 shadow-2xl backdrop-blur-lg">
          <header className="flex items-start justify-between gap-2 rounded-t-3xl bg-gradient-to-r from-emerald-500/30 to-slate-900 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-200">AI Concierge</p>
              <h2 className="text-lg font-semibold text-slate-950">Schiehallion at your service</h2>
              <p className="text-xs text-emerald-100/80">Multi-lingual guidance powered by our local knowledge base.</p>
            </div>
            <select
              aria-label="Concierge language"
              className="rounded-full border border-emerald-400/40 bg-black/40 px-3 py-1 text-xs text-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              value={language}
              onChange={event => setLanguage(event.target.value as SupportedLanguage)}
            >
              {SUPPORTED_LANGUAGES.map(option => (
                <option key={option} value={option} className="bg-slate-900 text-slate-100">
                  {languageLabels[option]}
                </option>
              ))}
            </select>
          </header>

          <div className="space-y-3 px-5 py-4">
            <div className="h-72 overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-3">
              <div className="flex flex-col gap-3">
                {messages.map(message => (
                  <div key={message.id} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                        message.role === 'assistant'
                          ? 'border border-emerald-400/30 bg-gradient-to-br from-slate-900/90 to-slate-950/90 text-emerald-100'
                          : 'bg-emerald-400 text-slate-950'
                      }`}
                    >
                      <p>{message.content}</p>
                      {message.details && message.details.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-emerald-100/80">
                          {message.details.map((detail, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {message.followUps && message.followUps.length > 0 && (
                        <div className="mt-2 space-y-1 text-xs italic text-emerald-200/80">
                          {message.followUps.map((followUp, index) => (
                            <p key={index}>{followUp}</p>
                          ))}
                        </div>
                      )}
                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.actions.map(action => (
                            <a
                              key={action.url}
                              href={action.url}
                              className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-400/20"
                            >
                              {action.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isProcessing && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-emerald-400/20 bg-slate-900/80 px-4 py-3 text-sm text-emerald-100">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        Typing recommendations…
                      </span>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            {quickReplies.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {quickReplies.map(reply => (
                  <button
                    key={reply.id}
                    type="button"
                    onClick={() => handleQuickReply(reply)}
                    className="rounded-full border border-emerald-400/30 bg-transparent px-3 py-1 text-xs text-emerald-200 transition hover:bg-emerald-400/20"
                  >
                    {reply.label}
                  </button>
                ))}
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
              <textarea
                className="h-20 w-full resize-none rounded-xl border border-white/10 bg-transparent px-3 py-2 text-sm text-slate-950 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                placeholder={inputPlaceholder}
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.35em] text-emerald-200">
                  Gemini + OpenAI · Hospitality tuned
                </span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleOpen}
        className="flex items-center gap-3 rounded-full border border-emerald-400/40 bg-gradient-to-r from-emerald-500 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-xl transition hover:from-emerald-400 hover:to-emerald-300"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/20 text-lg">✨</span>
        {isOpen ? 'Hide concierge' : 'Ask our concierge'}
      </button>
    </div>
  )
}
