import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  
  // ✅ CORREÇÃO 1: Garante que a sessão, o usuário e o ID existem
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const groups = await prisma.group.findMany({
    where: {
      // ✅ CORREÇÃO 2: Como garantimos no `if` acima, podemos remover o "?"
      GroupMember: { some: { userId: session.user.id } },
    },
    include: { GroupMember: { include: { User: { select: { id: true, name: true } } } } },
  })

  return NextResponse.json(groups)
}

export async function POST(req: Request) {
  const session = await auth()
  
  // ✅ CORREÇÃO 3: Mesma garantia de segurança aqui no POST
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { name, memberIds } = await req.json()

  const group = await prisma.group.create({
    data: {
      name,
      GroupMember: {
        create: [
          // ✅ CORREÇÃO 4: Sem o "?", o TypeScript sabe que é uma string válida
          { userId: session.user.id },
          ...memberIds.map((id: string) => ({ userId: id })),
        ],
      },
    },
  })

  return NextResponse.json(group)
}