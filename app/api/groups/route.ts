import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const groups = await prisma.group.findMany({
    where: {
      GroupMember: { some: { userId: session.user?.id } },
    },
    include: { GroupMember: { include: { User: { select: { id: true, name: true } } } } },
  })

  return NextResponse.json(groups)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const { name, memberIds } = await req.json()

  const group = await prisma.group.create({
    data: {
      name,
      GroupMember: {
        create: [
          { userId: session.user?.id },
          ...memberIds.map((id: string) => ({ userId: id })),
        ],
      },
    },
  })

  return NextResponse.json(group)
}