// GET: retorna todos os usuários cadastrados exceto o usuário logado
// Usado para popular a lista de contatos no chat
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    where: { 
      id: { 
        not: session.user.id 
      } 
    },
    select: { id: true, name: true, email: true, image: true },
  })

  return NextResponse.json(users)
}