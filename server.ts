// Servidor customizado que substitui o servidor padrão do Next.js
// Necessário para rodar o Socket.io junto com o Next.js
// Cria salas (rooms) para conversas privadas e grupos
// Eventos: join_room (entrar na sala) e send_message (enviar mensagem)
import { createServer } from "http"
import { Server } from "socket.io"
import next from "next"

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  })

  io.on("connection", (socket) => {
    console.log("Usuário conectado:", socket.id)

    // Entrar em uma sala (chat privado ou grupo)
    socket.on("join_room", (roomId: string) => {
      socket.join(roomId)
      console.log(`Socket ${socket.id} entrou na sala ${roomId}`)
    })

    // Enviar mensagem
    socket.on("send_message", (data: {
      roomId: string
      message: string
      senderId: string
      senderName: string
    }) => {
      io.to(data.roomId).emit("receive_message", {
        message: data.message,
        senderId: data.senderId,
        senderName: data.senderName,
        createdAt: new Date().toISOString(),
      })
    })

    socket.on("disconnect", () => {
      console.log("Usuário desconectado:", socket.id)
    })
  })

  httpServer.listen(3000, () => {
    console.log("> Servidor rodando em http://localhost:3000")
  })
})