import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Ic } from './Ic'

export interface CuadernoSettings {
  grid: 'lines' | 'dots' | 'iso' | 'none'
  color: 'neutral' | 'blue' | 'violet' | 'amber'
  fade: boolean
  texture: 'wrinkled' | 'grain' | 'none'
  opacity: number
}

export const DEFAULT_CUADERNO_SETTINGS: CuadernoSettings = {
  grid: 'lines',
  color: 'blue',
  fade: true,
  texture: 'wrinkled',
  opacity: 0.22,
}

function applySettingsToDOM(s: CuadernoSettings) {
  const root = document.documentElement
  root.setAttribute('data-grid', s.grid)
  root.setAttribute('data-grid-color', s.color)
  root.setAttribute('data-grid-fade', String(s.fade))
  root.setAttribute('data-paper-texture', s.texture)
  root.style.setProperty('--paper-texture-opacity', String(s.opacity))
}

export function CuadernoConfigTrigger() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [settings, setSettings] = useState<CuadernoSettings>(DEFAULT_CUADERNO_SETTINGS)

  // Mount check for client portal
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cuaderno_settings')
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CuadernoSettings>
        const merged: CuadernoSettings = { ...DEFAULT_CUADERNO_SETTINGS, ...parsed }
        setSettings(merged)
        applySettingsToDOM(merged)
      } else {
        applySettingsToDOM(DEFAULT_CUADERNO_SETTINGS)
      }
    } catch {
      applySettingsToDOM(DEFAULT_CUADERNO_SETTINGS)
    }
  }, [])

  // Update a single setting
  const update = useCallback((partial: Partial<CuadernoSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      applySettingsToDOM(next)
      try {
        localStorage.setItem('cuaderno_settings', JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setSettings(DEFAULT_CUADERNO_SETTINGS)
    applySettingsToDOM(DEFAULT_CUADERNO_SETTINGS)
    try {
      localStorage.setItem('cuaderno_settings', JSON.stringify(DEFAULT_CUADERNO_SETTINGS))
    } catch {}
  }, [])

  // Close on Escape key
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        className="icon-btn notebook-config-trigger"
        aria-label="Personalizar Cuaderno del Ingeniero"
        title="Personalizar Cuaderno (Pauta, Textura y Colores)"
        onClick={() => setOpen(true)}
      >
        <Ic name="sliders" size={18} sw={1.8} />
      </button>

      {open && mounted && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Personalización del Cuaderno"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflowY: 'auto',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Modal Card */}
          <div
            className="card"
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: 480,
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
              padding: '22px 24px',
              borderRadius: 18,
              boxShadow: 'var(--sh-panel)',
              background: 'var(--bg)',
              border: '1px solid var(--line-3)',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              margin: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>📐</span>
                  <h2 style={{ fontSize: 19, fontWeight: 750, letterSpacing: '-.02em', margin: 0 }}>
                    Taller del Cuaderno
                  </h2>
                </div>
                <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
                  Personaliza la pauta, textura de papel y detalles analógicos.
                </p>
              </div>
              <button
                className="icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Cerrar modal"
                style={{ marginTop: -4, marginRight: -6 }}
              >
                <Ic name="xCircle" size={20} sw={1.8} />
              </button>
            </div>

            {/* SECTION 1: Estilo de Pauta */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Estilo de Pauta
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {[
                  { id: 'lines', label: 'Cuadrícula', desc: 'Libreta de cálculo / ingeniería' },
                  { id: 'dots', label: 'Puntos', desc: 'Estilo Bullet Journal / Moleskine' },
                  { id: 'iso', label: 'Isométrico', desc: 'Pauta en rombo a 45°' },
                  { id: 'none', label: 'Sin pauta', desc: 'Papel liso minimalista' },
                ].map((item) => {
                  const active = settings.grid === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => update({ grid: item.id as CuadernoSettings['grid'] })}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        borderRadius: 10,
                        border: active ? '2px solid var(--blue)' : '1px solid var(--line-2)',
                        background: active ? 'var(--blue-tint)' : 'var(--bg-soft)',
                        color: active ? 'var(--blue-700)' : 'var(--ink)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ fontSize: 13.5, fontWeight: 650 }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: active ? 'var(--blue)' : 'var(--muted)', marginTop: 2 }}>{item.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* SECTION 2: Color de la Pauta */}
            {settings.grid !== 'none' && (
              <div>
                <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Tinta de la Pauta
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {[
                    { id: 'blue', label: 'Blueprint', swatch: '#3b82f6' },
                    { id: 'neutral', label: 'Grafito', swatch: '#94a3b8' },
                    { id: 'violet', label: 'Creativo', swatch: '#8b5cf6' },
                    { id: 'amber', label: 'Taller', swatch: '#f59e0b' },
                  ].map((col) => {
                    const active = settings.color === col.id
                    return (
                      <button
                        key={col.id}
                        onClick={() => update({ color: col.id as CuadernoSettings['color'] })}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 6,
                          padding: '10px 6px',
                          borderRadius: 10,
                          border: active ? '2px solid var(--blue)' : '1px solid var(--line-2)',
                          background: active ? 'var(--blue-tint)' : 'var(--bg-soft)',
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: col.swatch,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        />
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: active ? 'var(--blue-700)' : 'var(--ink-2)' }}>
                          {col.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* SECTION 3: Degradado / Foco central */}
            {settings.grid !== 'none' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'var(--bg-soft)',
                  border: '1px solid var(--line-2)',
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 650 }}>Desvanecer bordes (Degradado)</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                    Suaviza la cuadrícula hacia los extremos para mayor foco visual
                  </div>
                </div>
                <button
                  onClick={() => update({ fade: !settings.fade })}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: settings.fade ? 'var(--blue)' : 'var(--line-3)',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: settings.fade ? 22 : 2,
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      transition: 'left 0.2s ease',
                    }}
                  />
                </button>
              </div>
            )}

            {/* SECTION 4: Textura de Papel */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Textura del Papel
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { id: 'wrinkled', label: 'Papel arrugado', desc: 'Pliegues y relieve orgánico' },
                  { id: 'grain', label: 'Grano sutil', desc: 'Ruido analógico tradicional' },
                  { id: 'none', label: 'Liso', desc: 'Fondo plano limpio' },
                ].map((t) => {
                  const active = settings.texture === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => update({ texture: t.id as CuadernoSettings['texture'] })}
                      style={{
                        padding: '10px 8px',
                        textAlign: 'left',
                        borderRadius: 10,
                        border: active ? '2px solid var(--blue)' : '1px solid var(--line-2)',
                        background: active ? 'var(--blue-tint)' : 'var(--bg-soft)',
                        color: active ? 'var(--blue-700)' : 'var(--ink)',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 650 }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: active ? 'var(--blue)' : 'var(--muted)', marginTop: 2 }}>{t.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* SECTION 5: Intensidad de Textura */}
            {settings.texture !== 'none' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Intensidad de Textura
                  </label>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)' }}>
                    {Math.round(settings.opacity * 100)}%
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {[
                    { val: 0.12, label: 'Sutil (12%)' },
                    { val: 0.22, label: 'Media (22%)' },
                    { val: 0.35, label: 'Marcada (35%)' },
                  ].map((level) => {
                    const active = Math.abs(settings.opacity - level.val) < 0.05
                    return (
                      <button
                        key={level.val}
                        onClick={() => update({ opacity: level.val })}
                        style={{
                          padding: '8px 4px',
                          textAlign: 'center',
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 600,
                          border: active ? '2px solid var(--blue)' : '1px solid var(--line-2)',
                          background: active ? 'var(--blue-tint)' : 'var(--bg-soft)',
                          color: active ? 'var(--blue-700)' : 'var(--ink-2)',
                          cursor: 'pointer',
                        }}
                      >
                        {level.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 14,
                borderTop: '1px solid var(--line)',
              }}
            >
              <button
                onClick={reset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: 'var(--ink-3)',
                  background: 'transparent',
                  border: '1px solid var(--line-2)',
                  cursor: 'pointer',
                }}
              >
                <Ic name="refreshCw" size={13} sw={2} />
                Restablecer
              </button>

              <button
                className="btn btn-primary"
                onClick={() => setOpen(false)}
                style={{ padding: '8px 18px', fontSize: 13.5, fontWeight: 650 }}
              >
                Listo
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
