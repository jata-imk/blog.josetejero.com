'use client'

import { useState } from 'react'

type FormState = 'idle' | 'sending' | 'sent' | 'error'

export function CommentForm({
  postId,
  parentId,
  replyingTo,
  onCancel,
}: {
  postId: string
  parentId?: string
  replyingTo?: string
  onCancel?: () => void
}) {
  const [state, setState] = useState<FormState>('idle')
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [text, setText] = useState('')
  // Honeypot: si esto llega relleno, lo ha escrito un bot.
  const [website, setWebsite] = useState('')

  const isReply = Boolean(parentId)
  // Puede haber varios formularios montados a la vez (uno por hilo abierto): los ids del DOM y los
  // `htmlFor` de las etiquetas tienen que ser únicos o el clic en la etiqueta enfoca el campo ajeno.
  const fieldId = (field: string) => `cf-${field}-${parentId ?? 'root'}`

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/comments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, parentId, name, email, text, website }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        setError(data.error || 'No se pudo enviar el comentario. Inténtalo de nuevo.')
        setState('error')
        return
      }
      setName('')
      setEmail('')
      setText('')
      setState('sent')
    } catch {
      setError('No se pudo enviar el comentario. Inténtalo de nuevo.')
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div className="ab-comment-sent" role="status">
        <p>¡Gracias! Tu comentario se publicará en cuanto pase la moderación.</p>
        <button
          type="button"
          className="btn btn-secondary self-start"
          onClick={() => (isReply && onCancel ? onCancel() : setState('idle'))}
        >
          {isReply ? 'Cerrar' : 'Escribir otro comentario'}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="ab-form-head">
        <h3 className="text-lg font-bold m-0">
          {isReply ? `Responder a ${replyingTo}` : 'Deja un comentario'}
        </h3>
        {isReply && (
          <button type="button" className="ab-form-cancel" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>

      {state === 'error' && <p className="text-rose text-sm">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div className="ab-field">
          <label htmlFor={fieldId('name')}>Nombre</label>
          <input
            id={fieldId('name')}
            className="ab-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
          />
        </div>
        <div className="ab-field">
          <label htmlFor={fieldId('email')}>Email</label>
          <input
            id={fieldId('email')}
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
        <label htmlFor={fieldId('text')}>Comentario</label>
        <textarea
          id={fieldId('text')}
          className="ab-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe tu comentario…"
          rows={5}
          required
        />
      </div>

      {/* Trampa para bots: fuera de pantalla en vez de display:none, que muchos detectan. */}
      <div className="ab-honeypot" aria-hidden="true">
        <label htmlFor={fieldId('website')}>No rellenes este campo</label>
        <input
          id={fieldId('website')}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <p className="text-xs text-muted">
        Los comentarios se publican tras moderación. Tu email no se publica.
      </p>

      <button type="submit" className="btn btn-grad self-start" disabled={state === 'sending'}>
        {state === 'sending' ? 'Enviando…' : isReply ? 'Publicar respuesta' : 'Publicar comentario'}
      </button>
    </form>
  )
}
