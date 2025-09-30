import type { Metadata } from 'next'
import { Playfair_Display, Source_Sans_3 } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import ChatbotWidget from '@/components/chat/ChatbotWidget'

const heading = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-heading',
})

const body = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Schiehallion Hotel · Highland Hospitality Reimagined',
  description:
    'First-pass experience map for the Schiehallion Hotel digital platform, covering rooms, dining, local adventures, and the supporting tech stack.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <ChatbotWidget />
        </AuthProvider>
      </body>
    </html>
  )
}