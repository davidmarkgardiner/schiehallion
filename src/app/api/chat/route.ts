import { NextRequest } from 'next/server'
import { handleChatRequest } from '@chatbot'

export async function POST(request: NextRequest) {
  return handleChatRequest(request)
}
