import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Texas Water Service Request',
  description: 'Municipal water, trash, and recycling service application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
