import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")

  if (type === "group") {
    await prisma.message.deleteMany({ where: { groupId: params.id } })
    await prisma.groupMember.deleteMany({ where: { groupId: params.id } })
    await prisma.group.delete({ where: { id: params.id } })
  } else {
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: params.id },
          { senderId: params.id, receiverId: session.user.id },
        ],
      },
    })
  }

  return NextResponse.json({ success: true })
}