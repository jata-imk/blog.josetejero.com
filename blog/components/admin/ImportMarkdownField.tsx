'use client'

/**
 * Campo UI de Payload que muestra un botón "Importar Markdown" en el editor de Posts.
 * Flujo: botón → modal → pegar/subir MD → POST /api/posts/:id/import-md →
 *   el servidor convierte y actualiza el body del post → recarga el documento.
 *
 * ADR 0024 — la inyección se hace vía server update (no por estado del cliente),
 * porque el editor Lexical de Payload inicializa su editorState al montar y no
 * permite hidratarlo desde fuera sin re-montar.
 */

import React, { useCallback, useRef, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

type ImportReport = {
  imagesUploaded: string[]
  imagesFailed: string[]
  asides: number
  nodesDropped: string[]
}

export function ImportMarkdownField() {
  const { id } = useDocumentInfo()
  const [open, setOpen] = useState(false)
  const [md, setMd] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [report, setReport] = useState<ImportReport | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setMd(String(ev.target?.result ?? ''))
    reader.readAsText(file)
  }, [])

  const handleImport = useCallback(async () => {
    if (!id) {
      setErrorMsg('Guarda el post primero para poder importar.')
      setStatus('error')
      return
    }
    if (!md.trim()) {
      setErrorMsg('Pega o selecciona un archivo Markdown.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMsg('')
    setReport(null)

    try {
      const res = await fetch(`/api/posts/${id}/import-md`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ md }),
        credentials: 'include',
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data?.error ?? `HTTP ${res.status}`)
      }

      const data = (await res.json()) as { ok: boolean; report: ImportReport }
      setReport(data.report)
      setStatus('success')

      // Recarga del documento para que el editor Lexical muestre el nuevo body
      // Pequeño delay para que el POST se propague antes del reload
      setTimeout(() => {
        window.location.reload()
      }, 1200)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }, [id, md])

  const handleClose = useCallback(() => {
    setOpen(false)
    setMd('')
    setStatus('idle')
    setReport(null)
    setErrorMsg('')
    if (fileRef.current) fileRef.current.value = ''
  }, [])

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: '6px 14px',
          fontSize: 13,
          fontWeight: 600,
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 4,
          background: 'var(--theme-elevation-50)',
          cursor: 'pointer',
          color: 'var(--theme-text)',
        }}
      >
        ↑ Importar Markdown
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleClose}
        >
          {/* Modal */}
          <div
            style={{
              background: 'var(--theme-bg)',
              borderRadius: 8,
              padding: 28,
              width: 'min(680px, 92vw)',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,.35)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Importar Markdown</h3>
              <button
                type="button"
                onClick={handleClose}
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--theme-text)' }}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {!id && (
              <div style={{ padding: '10px 14px', background: 'var(--theme-warning-500)', borderRadius: 4, marginBottom: 14, fontSize: 13 }}>
                ⚠️ Guarda el post primero para poder importar el cuerpo.
              </div>
            )}

            {/* Subir archivo */}
            <label style={{ display: 'block', marginBottom: 12, fontSize: 13, fontWeight: 600 }}>
              Seleccionar archivo .md
              <input
                ref={fileRef}
                type="file"
                accept=".md,.mdx,text/markdown,text/plain"
                onChange={handleFileChange}
                style={{ display: 'block', marginTop: 6 }}
              />
            </label>

            {/* O pegar el MD */}
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>
              O pega el Markdown aquí
              <textarea
                value={md}
                onChange={(e) => setMd(e.target.value)}
                rows={12}
                placeholder="# Título&#10;&#10;Contenido..."
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: 6,
                  fontFamily: 'monospace',
                  fontSize: 12,
                  padding: '8px 10px',
                  border: '1px solid var(--theme-elevation-200)',
                  borderRadius: 4,
                  background: 'var(--theme-elevation-50)',
                  color: 'var(--theme-text)',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
            </label>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                type="button"
                onClick={handleImport}
                disabled={status === 'loading' || !id}
                style={{
                  padding: '8px 20px',
                  fontWeight: 700,
                  fontSize: 13,
                  border: 'none',
                  borderRadius: 4,
                  background: status === 'loading' ? 'var(--theme-elevation-150)' : 'var(--theme-success-500)',
                  color: '#fff',
                  cursor: status === 'loading' || !id ? 'not-allowed' : 'pointer',
                }}
              >
                {status === 'loading' ? 'Importando…' : 'Importar'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  border: '1px solid var(--theme-elevation-200)',
                  borderRadius: 4,
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--theme-text)',
                }}
              >
                Cancelar
              </button>
            </div>

            {/* Feedback */}
            {status === 'error' && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--theme-error-500)', color: '#fff', borderRadius: 4, fontSize: 13 }}>
                ❌ {errorMsg}
              </div>
            )}

            {status === 'success' && report && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--theme-success-100)', borderRadius: 4, fontSize: 12 }}>
                <strong>✅ Importado. El editor recargará en 1 segundo.</strong>
                {report.imagesUploaded.length > 0 && (
                  <p style={{ margin: '6px 0 0' }}>
                    🖼 Imágenes subidas: {report.imagesUploaded.length}
                  </p>
                )}
                {report.imagesFailed.length > 0 && (
                  <p style={{ margin: '4px 0 0', color: 'var(--theme-error-600)' }}>
                    ⚠️ Imágenes fallidas: {report.imagesFailed.join(', ')}
                  </p>
                )}
                {report.asides > 0 && (
                  <p style={{ margin: '4px 0 0' }}>
                    💬 Callouts convertidos: {report.asides}
                  </p>
                )}
                {report.nodesDropped.length > 0 && (
                  <p style={{ margin: '4px 0 0', color: 'var(--theme-warning-600)' }}>
                    ℹ️ Nodos degradados: {report.nodesDropped.join('; ')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
