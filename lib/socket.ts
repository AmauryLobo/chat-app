// Cria e reutiliza uma única instância do Socket.io no cliente
// Evita criar múltiplas conexões ao navegar entre páginas
import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: "/socket.io",
    })
  }
  return socket
}