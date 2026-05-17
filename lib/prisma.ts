// Instância global do Prisma Client
// O padrão globalThis evita criar múltiplas conexões durante o desenvolvimento
// Em produção, uma nova instância é criada normalmente
import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") global.prisma = prisma