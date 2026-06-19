'use client'

import { useState } from 'react'

type FormState = 'idle' | 'sending' | 'error'

export function CommentForm({ postId }: { postId: string }) {
  const [state, setState] = useState<FormState>('idle')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [text, setText] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch(`/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, name, email, text }),
      })
      if (!res.ok) throw new Error('error')
      setName(''); setEmail(''); setText('')
      setState('idle')
    } catch {
      setState('error')
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <h3 className="text-lg font-bold m-0">Deja un comentario</h3>

      {state === 'error' && (
        <p className="text-rose text-sm">
          No se pudo enviar el comentario. Inténtalo de nuevo.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="ab-field">
          <label htmlFor="cf-name">Nombre</label>
          <input
            id="cf-name"
            className="ab-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
          />
        </div>
        <div className="ab-field">
          <label htmlFor="cf-email">Email</label>
          <input
            id="cf-email"
            className="ab-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
        </div>
      </div>

      <div className="ab-field">
        <label htmlFor="cf-text">Comentario</label>
        <textarea
          id="cf-text"
          className="ab-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe tu comentario…"
          rows={5}
          required
        />
      </div>

      <p className="text-xs text-muted">
        Los comentarios se publican tras moderación.
      </p>

      <button
        type="submit"
        className="btn btn-grad self-start"
        disabled={state === 'sending'}
      >
        {state === 'sending' ? 'Enviando…' : 'Publicar comentario'}
      </button>
    </form>
  )
}
