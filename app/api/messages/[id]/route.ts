import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { id } = await params
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")

  if (type === "group") {
    await prisma.message.deleteMany({ where: { groupId: id } })
    await prisma.groupMember.deleteMany({ where: { groupId: id } })
    await prisma.group.delete({ where: { id } })
  } else {
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: session.user?.id!, receiverId: id },
          { senderId: id, receiverId: session.user?.id! },
        ],
      },
    })
  }

  return NextResponse.json({ success: true })
}