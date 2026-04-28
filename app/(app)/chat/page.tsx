"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { getSocket } from "@/lib/socket"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type User = { id: string; name: string | null; email: string }
type Group = { id: string; name: string }
type Message = {
  id?: string
  content: string
  senderId: string
  senderName: string
  createdAt: string
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [newGroupName, setNewGroupName] = useState("")
  const [showNewGroup, setShowNewGroup] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const socket = getSocket()
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  // Carregar usuários e grupos
  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(setUsers)
    fetch("/api/groups").then(r => r.json()).then(setGroups)
  }, [])

  // Entrar na sala e carregar mensagens
  useEffect(() => {
    if (!session) return
    const roomId = selectedGroup
      ? `group_${selectedGroup.id}`
      : selectedUser
      ? [session.user.id, selectedUser.id].sort().join("_")
      : null

    if (!roomId) return

    socket.emit("join_room", roomId)

    const url = selectedGroup
      ? `/api/messages?groupId=${selectedGroup.id}`
      : `/api/messages?receiverId=${selectedUser?.id}`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        setMessages(data.map((m: any) => ({
          id: m.id,
          content: m.content,
          senderId: m.senderId,
          senderName: m.User?.name || "Usuário",
          createdAt: m.createdAt,
        })))
      })

    socket.on("receive_message", (msg: Message) => {
      setMessages(prev => [...prev, msg])
    })

    return () => { socket.off("receive_message") }
  }, [selectedUser, selectedGroup, session])

  // Scroll automático
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || !session) return

    const roomId = selectedGroup
      ? `group_${selectedGroup.id}`
      : selectedUser
      ? [session.user.id, selectedUser.id].sort().join("_")
      : null

    if (!roomId) return

    // Salvar no banco
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: input,
        receiverId: selectedUser?.id || null,
        groupId: selectedGroup?.id || null,
      }),
    })

    // Emitir pelo socket
    socket.emit("send_message", {
      roomId,
      message: input,
      senderId: session.user.id,
      senderName: session.user.name || "Usuário",
    })

    setInput("")
  }

  async function createGroup() {
  if (!newGroupName.trim()) return
  const res = await fetch("/api/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newGroupName, memberIds: selectedMembers }),
  })
  const group = await res.json()
  setGroups(prev => [...prev, group])
  setNewGroupName("")
  setSelectedMembers([])
  setShowNewGroup(false)
}

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r flex flex-col p-4 gap-2">
        <h2 className="font-semibold text-lg">Chat</h2>

        <p className="text-xs text-muted-foreground uppercase mt-2">Pessoas</p>
        {users.map(user => (
          <button
            key={user.id}
            onClick={() => { setSelectedUser(user); setSelectedGroup(null); setMessages([]) }}
            className={`text-left px-3 py-2 rounded-lg text-sm hover:bg-muted ${selectedUser?.id === user.id ? "bg-muted font-medium" : ""}`}
          >
            {user.name || user.email}
          </button>
        ))}

        <p className="text-xs text-muted-foreground uppercase mt-2">Grupos</p>
        {groups.map(group => (
          <button
            key={group.id}
            onClick={() => { setSelectedGroup(group); setSelectedUser(null); setMessages([]) }}
            className={`text-left px-3 py-2 rounded-lg text-sm hover:bg-muted ${selectedGroup?.id === group.id ? "bg-muted font-medium" : ""}`}
          >
            {group.name}
          </button>
        ))}

        {showNewGroup ? (
  <div className="flex flex-col gap-2 mt-2">
    <Input
      value={newGroupName}
      onChange={e => setNewGroupName(e.target.value)}
      placeholder="Nome do grupo"
    />
    <p className="text-xs text-muted-foreground">Selecionar membros:</p>
    {users.map(user => (
      <label key={user.id} className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          value={user.id}
          onChange={e => {
            if (e.target.checked) {
              setSelectedMembers(prev => [...prev, user.id])
            } else {
              setSelectedMembers(prev => prev.filter(id => id !== user.id))
            }
          }}
        />
        {user.name || user.email}
      </label>
    ))}
    <Button size="sm" onClick={createGroup}>Criar</Button>
    <Button size="sm" variant="ghost" onClick={() => setShowNewGroup(false)}>Cancelar</Button>
  </div>
) : (
  <Button size="sm" variant="outline" onClick={() => setShowNewGroup(true)} className="mt-2">
    + Novo grupo
  </Button>
)}
      </div>

      {/* Área do chat */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold">
            {selectedUser?.name || selectedGroup?.name || "Selecione uma conversa"}
          </h3>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col max-w-xs ${msg.senderId === session?.user.id ? "ml-auto items-end" : "items-start"}`}
            >
              <span className="text-xs text-muted-foreground mb-1">{msg.senderName}</span>
              <div className={`px-4 py-2 rounded-2xl text-sm ${msg.senderId === session?.user.id ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {(selectedUser || selectedGroup) && (
          <div className="border-t p-4 flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Digite uma mensagem..."
              className="flex-1"
            />
            <Button onClick={sendMessage}>Enviar</Button>
          </div>
        )}
      </div>
    </div>
  )
}