import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      User: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json(posts)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { content } = await req.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: "Conteúdo vazio" }, { status: 400 })
  }

  const post = await prisma.post.create({
    data: {
      content,
      authorId: session.user.id,
    },
    include: {
      User: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json(post)
}