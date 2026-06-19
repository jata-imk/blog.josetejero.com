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
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Deja un comentario</h3>

      {state === 'error' && (
        <p style={{ color: 'var(--rose)', fontSize: 14 }}>
          No se pudo enviar el comentario. Inténtalo de nuevo.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

      <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>
        Los comentarios se publican tras moderación.
      </p>

      <button
        type="submit"
        className="btn btn-grad"
        disabled={state === 'sending'}
        style={{ alignSelf: 'flex-start' }}
      >
        {state === 'sending' ? 'Enviando…' : 'Publicar comentario'}
      </button>
    </form>
  )
}
