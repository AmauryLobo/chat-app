"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Post = {
  id: string
  content: string
  createdAt: string
  User: { id: string; name: string | null; email: string }
}

export default function FeedPage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState<Post[]>([])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/posts")
      .then(r => r.json())
      .then(setPosts)
  }, [])

  async function createPost() {
    if (!content.trim()) return
    setLoading(true)

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    })

    const post = await res.json()
    setPosts(prev => [post, ...prev])
    setContent("")
    setLoading(false)
  }

async function deletePost(postId: string) {
  await fetch(`/api/posts/delete?postId=${postId}`, { method: "DELETE" })
  setPosts(prev => prev.filter(p => p.id !== postId))
}

  return (
    <div className="max-w-xl mx-auto py-8 px-4 flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Feed</h1>

      {/* Criar post */}
      <div className="border rounded-xl p-4 flex flex-col gap-3">
        <Textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="No que você está pensando?"
          rows={3}
        />
        <Button onClick={createPost} disabled={loading} className="self-end">
          {loading ? "Publicando..." : "Publicar"}
        </Button>
      </div>

      {/* Lista de posts */}
      {posts.length === 0 && (
        <p className="text-muted-foreground text-center">Nenhuma postagem ainda.</p>
      )}

      {posts.map(post => (
  <div key={post.id} className="border rounded-xl p-4 flex flex-col gap-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
          {(post.User.name || post.User.email)[0].toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium">{post.User.name || post.User.email}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      {post.User.id === session?.user?.id && (
        <button
          onClick={() => deletePost(post.id)}
          className="text-xs text-red-400 hover:text-red-600"
        >
          ✕ Excluir
        </button>
      )}
    </div>
    <p className="text-sm">{post.content}</p>
  </div>
      ))}
    </div>
  )
}