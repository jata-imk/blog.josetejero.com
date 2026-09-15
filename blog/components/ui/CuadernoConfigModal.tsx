'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Ic } from './Ic'

// Panel "Taller del Cuaderno" (ADR 0036). Las preferencias viven en localStorage y se
// reflejan como data-* en <html>; el CSS (globals.css) hace todo el trabajo visual.
// CUADERNO_BOOTSTRAP_SCRIPT aplica lo guardado antes del primer paint, así que este
// componente solo sincroniza su estado al montar y escribe cuando el visitante cambia algo.

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
  opacity: 0.40,
}

const STORAGE_KEY = 'cuaderno_settings'

// Debe coincidir con el multiplicador de `[data-theme="dark"] .paper-canvas-texture`.
const DARK_TEXTURE_FACTOR = 0.42

const GRID_OPTIONS: { id: CuadernoSettings['grid']; label: string; desc: string }[] = [
  { id: 'lines', label: 'Cuadrícula', desc: 'Libreta de cálculo / ingeniería' },
  { id: 'dots', label: 'Puntos', desc: 'Estilo Bullet Journal / Moleskine' },
  { id: 'iso', label: 'Isométrico', desc: 'Pauta de puntos alternados' },
  { id: 'none', label: 'Sin pauta', desc: 'Papel liso minimalista' },
]

// El swatch pinta con data-grid-color, que resuelve el color real desde los tokens.
const COLOR_OPTIONS: { id: CuadernoSettings['color']; label: string }[] = [
  { id: 'blue', label: 'Blueprint' },
  { id: 'neutral', label: 'Grafito' },
  { id: 'violet', label: 'Creativo' },
  { id: 'amber', label: 'Taller' },
]

const TEXTURE_OPTIONS: { id: CuadernoSettings['texture']; label: string; desc: string }[] = [
  { id: 'wrinkled', label: 'Papel arrugado', desc: 'Pliegues y relieve orgánico' },
  { id: 'grain', label: 'Grano sutil', desc: 'Ruido analógico tradicional' },
  { id: 'none', label: 'Liso', desc: 'Fondo plano limpio' },
]

const INTENSITY_OPTIONS = [
  { val: 0.24, label: 'Sutil' },
  { val: 0.40, label: 'Media' },
  { val: 0.56, label: 'Marcada' },
]

function effectivePercent(opacity: number, isDark: boolean) {
  return Math.round(opacity * (isDark ? DARK_TEXTURE_FACTOR : 1) * 100)
}

function applySettingsToDOM(s: CuadernoSettings) {
  const root = document.documentElement
  root.setAttribute('data-grid', s.grid)
  root.setAttribute('data-grid-color', s.color)
  root.setAttribute('data-grid-fade', String(s.fade))
  root.setAttribute('data-paper-texture', s.texture)
  root.style.setProperty('--paper-texture-opacity', String(s.opacity))
}

function persist(s: CuadernoSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    // storage bloqueado (modo privado / cuota): el ajuste aplica solo en esta sesión
  }
}

export function CuadernoConfigTrigger() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [settings, setSettings] = useState<CuadernoSettings>(DEFAULT_CUADERNO_SETTINGS)

  // Tema actual: solo cambia los porcentajes mostrados de intensidad.
  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    }
    checkDark()
    const obs = new MutationObserver(checkDark)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])

  // Sincroniza el estado con lo que el bootstrap ya aplicó desde localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<CuadernoSettings>
        setSettings({ ...DEFAULT_CUADERNO_SETTINGS, ...parsed })
      }
    } catch {
      // JSON corrupto: se queda con los defaults que el bootstrap aplicó
    }
  }, [])

  // Bloqueo de scroll mientras el panel está abierto (mismo patrón que el buscador).
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const update = useCallback((partial: Partial<CuadernoSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      applySettingsToDOM(next)
      persist(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setSettings(DEFAULT_CUADERNO_SETTINGS)
    applySettingsToDOM(DEFAULT_CUADERNO_SETTINGS)
    persist(DEFAULT_CUADERNO_SETTINGS)
  }, [])

  // <dialog> nativo con showModal(): foco atrapado, fondo inerte y Esc sin código extra.
  const openPanel = useCallback(() => {
    dialogRef.current?.showModal()
    setOpen(true)
  }, [])

  const closePanel = useCallback(() => {
    dialogRef.current?.close()
  }, [])

  // Evento 'close' cubre botón, Esc y clic en backdrop: un solo lugar restaura el foco.
  const onClose = useCallback(() => {
    setOpen(false)
    triggerRef.current?.focus({ preventScroll: true })
  }, [])

  // Clic fuera de la tarjeta (sobre el ::backdrop) → el target es el propio <dialog>.
  const onDialogClick = useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) closePanel()
  }, [closePanel])

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="icon-btn"
        aria-label="Personalizar Cuaderno del Ingeniero"
        aria-haspopup="dialog"
        aria-expanded={open}
        title="Personalizar Cuaderno (Pauta, Textura y Colores)"
        onClick={openPanel}
      >
        <Ic name="gear" size={18} sw={1.8} />
      </button>

      <dialog
        ref={dialogRef}
        className="nb-dialog"
        aria-labelledby="nb-title"
        aria-describedby="nb-desc"
        onClose={onClose}
        onClick={onDialogClick}
      >
        <div className="nb-panel">
          <div className="nb-head">
            <div>
              <h2 id="nb-title" className="nb-title">
                <span aria-hidden="true">📐</span> Taller del Cuaderno
              </h2>
              <p id="nb-desc" className="nb-desc">
                Personaliza la pauta, textura de papel y detalles analógicos.
              </p>
            </div>
            <button type="button" className="icon-btn" onClick={closePanel} aria-label="Cerrar">
              <Ic name="xCircle" size={20} sw={1.8} />
            </button>
          </div>

          <fieldset className="nb-group">
            <legend className="nb-legend">Estilo de pauta</legend>
            <div className="nb-options nb-options-2">
              {GRID_OPTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="nb-option"
                  aria-pressed={settings.grid === item.id}
                  onClick={() => update({ grid: item.id })}
                >
                  <span className="nb-option-label">{item.label}</span>
                  <span className="nb-option-desc">{item.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {settings.grid !== 'none' && (
            <>
              <fieldset className="nb-group">
                <legend className="nb-legend">Tinta de la pauta</legend>
                <div className="nb-options nb-options-4">
                  {COLOR_OPTIONS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      className="nb-option nb-option-swatch"
                      aria-pressed={settings.color === col.id}
                      onClick={() => update({ color: col.id })}
                    >
                      <span className="nb-swatch" data-grid-color={col.id} aria-hidden="true" />
                      <span className="nb-option-label">{col.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="nb-switch-row">
                <div>
                  <div id="nb-fade-label" className="nb-option-label">Desvanecer bordes</div>
                  <div className="nb-option-desc">
                    Suaviza la cuadrícula hacia los extremos para mayor foco visual
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  className="nb-switch"
                  aria-checked={settings.fade}
                  aria-labelledby="nb-fade-label"
                  onClick={() => update({ fade: !settings.fade })}
                />
              </div>
            </>
          )}

          <fieldset className="nb-group">
            <legend className="nb-legend">Textura del papel</legend>
            <div className="nb-options nb-options-3">
              {TEXTURE_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="nb-option"
                  aria-pressed={settings.texture === t.id}
                  onClick={() => update({ texture: t.id })}
                >
                  <span className="nb-option-label">{t.label}</span>
                  <span className="nb-option-desc">{t.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {settings.texture !== 'none' && (
            <fieldset className="nb-group">
              <legend className="nb-legend nb-legend-split">
                Intensidad de textura
                <span className="nb-legend-value">
                  {effectivePercent(settings.opacity, isDark)}% {isDark ? '(oscuro)' : '(claro)'}
                </span>
              </legend>
              <div className="nb-options nb-options-3">
                {INTENSITY_OPTIONS.map((level) => (
                  <button
                    key={level.val}
                    type="button"
                    className="nb-option nb-option-center"
                    aria-pressed={Math.abs(settings.opacity - level.val) < 0.05}
                    onClick={() => update({ opacity: level.val })}
                  >
                    <span className="nb-option-label">
                      {level.label} ({effectivePercent(level.val, isDark)}%)
                    </span>
                  </button>
                ))}
              </div>
              {isDark && (
                <p className="nb-note">
                  En modo oscuro la textura se atenúa automáticamente para preservar la
                  profundidad del fondo sin generar neblina.
                </p>
              )}
            </fieldset>
          )}

          <div className="nb-foot">
            <button type="button" className="nb-reset" onClick={reset}>
              <Ic name="refreshCw" size={13} sw={2} />
              Restablecer
            </button>
            <button type="button" className="btn btn-grad nb-done" onClick={closePanel}>
              Listo
            </button>
          </div>
        </div>
      </dialog>
    </>
  )
}
