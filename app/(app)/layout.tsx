import Link from "next/link"
import LogoutButton from "@/components/LogoutButton"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <nav className="border-b px-6 py-3 flex gap-4 items-center">
        <span className="font-semibold mr-4">Chat App</span>
        <Link href="/chat" className="text-sm hover:underline">Chat</Link>
        <Link href="/feed" className="text-sm hover:underline">Feed</Link>
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </nav>
      {children}
    </div>
  )
}