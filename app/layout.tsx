import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { AnalyticsTracker } from '@/components/analytics-tracker'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'First Step Consultancy Services | Unlock the Full Power of Investing',
  description:
    'First Step Consultancy Services - Your trusted investment consultant offering Mutual Funds, PMS, AIF, Bonds, Insurance, and comprehensive wealth management solutions.',
  keywords: [
    'investment consultancy',
    'mutual funds',
    'PMS',
    'AIF',
    'wealth management',
    'financial consultancy',
    'AMFI registered',
  ],
  icons: {
    icon: '/images/logo.jpg',
    apple: '/images/logo.jpg',
  },
}

export const viewport: Viewport = {
  themeColor: '#1a2744',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfairDisplay.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <AnalyticsTracker />
      </body>
    </html>
  )
}
