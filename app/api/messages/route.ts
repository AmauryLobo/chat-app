import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const receiverId = searchParams.get("receiverId")
  const groupId = searchParams.get("groupId")

  if (groupId) {
    const messages = await prisma.message.findMany({
      where: { groupId },
      include: { User: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(messages)
  }

  if (receiverId) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId },
          { senderId: receiverId, receiverId: session.user.id },
        ],
      },
      include: { User: { select: { id: true, name: true } } },
      orderBy: { createdAt: "asc" },
    })
    return NextResponse.json(messages)
  }

  return NextResponse.json([])
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { content, receiverId, groupId } = await req.json()

  const message = await prisma.message.create({
    data: {
      content,
      senderId: session.user.id,
      receiverId: receiverId || null,
      groupId: groupId || null,
    },
  })

  return NextResponse.json(message)
}