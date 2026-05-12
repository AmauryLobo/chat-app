import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const postId = searchParams.get("postId")

  if (!postId) return NextResponse.json({ error: "ID inválido" }, { status: 400 })

  const post = await prisma.post.findUnique({ where: { id: postId } })

  if (!post || post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  await prisma.post.delete({ where: { id: postId } })

  return NextResponse.json({ success: true })
}