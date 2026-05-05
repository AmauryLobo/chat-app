"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function LogoutButton() {
  const { data: session } = useSession()

  return (
    <div className="flex items-center gap-3">
      {session?.user && (
        <span className="text-sm text-muted-foreground">
          Olá, <strong>{session.user.name || session.user.email}</strong>
        </span>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        Sair
      </Button>
    </div>
  )
}