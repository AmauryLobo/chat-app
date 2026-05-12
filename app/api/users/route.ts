import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  // ✅ CORREÇÃO: Verificação rigorosa. 
  // Isso garante ao TypeScript que o session.user.id EXISTE nas linhas abaixo.
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    where: { 
      id: { 
        // ✅ Agora removemos o "?" pois a segurança acima garante que o ID é uma string
        not: session.user.id 
      } 
    },
    select: { id: true, name: true, email: true, image: true },
  })

  return NextResponse.json(users)
}