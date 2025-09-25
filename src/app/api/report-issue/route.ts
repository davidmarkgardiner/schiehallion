import { NextRequest } from 'next/server'
import { handleIssueReport } from '@chatbot'

export async function POST(request: NextRequest) {
  return handleIssueReport(request)
}
