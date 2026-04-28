import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import Link from "next/link"

const geist = Geist({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Chat App",
  description: "Chat em tempo real",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={geist.className}>
        <SessionProvider>
          <nav className="border-b px-6 py-3 flex gap-4 items-center">
            <span className="font-semibold mr-4">Chat App</span>
            <Link href="/chat" className="text-sm hover:underline">Chat</Link>
            <Link href="/feed" className="text-sm hover:underline">Feed</Link>
          </nav>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}