'use client'

import { useId, useState } from 'react'
import { Ic } from '@/components/ui/Ic'
import { OCTAL_MODE } from '@/lib/chmod'
import { CopyButton } from './CopyButton'

type Target = 'file' | 'dir'

/**
 * Bits chmod en octal. Los tres "especiales" (setuid/setgid/sticky) ocupan el
 * cuarto dígito octal (los 3 bits más altos); u/g/o ocupan los otros tres.
 */
const BITS = {
  suid: 0o4000,
  sgid: 0o2000,
  sticky: 0o1000,
  ur: 0o400,
  uw: 0o200,
  ux: 0o100,
  gr: 0o040,
  gw: 0o020,
  gx: 0o010,
  or: 0o004,
  ow: 0o002,
  ox: 0o001,
} as const

const GROUPS = [
  { key: 'u', label: 'Usuario', bits: { r: BITS.ur, w: BITS.uw, x: BITS.ux } },
  { key: 'g', label: 'Grupo', bits: { r: BITS.gr, w: BITS.gw, x: BITS.gx } },
  { key: 'o', label: 'Otros', bits: { r: BITS.or, w: BITS.ow, x: BITS.ox } },
] as const

// Los mismos tres bits significan cosas distintas sobre un fichero o una
// carpeta — es el corazón didáctico del post. Fuente única de la verdad para
// las glosas de la rejilla y, más abajo, el ejemplo de comando.
const MEANINGS: Record<Target, Record<'r' | 'w' | 'x', string>> = {
  file: {
    r: 'leer el contenido',
    w: 'modificar el contenido',
    x: 'ejecutarlo como programa',
  },
  dir: {
    r: 'listar lo que hay dentro (ls)',
    w: 'crear, borrar y renombrar entradas dentro',
    x: 'entrar en ella (cd) y acceder por nombre',
  },
}

const SPECIAL_LABELS = { suid: 'setuid (4000)', sgid: 'setgid (2000)', sticky: 'sticky (1000)' } as const

const SPECIAL_INFO: Record<Target, Record<keyof typeof SPECIAL_LABELS, { text: string; inert: boolean }>> = {
  file: {
    suid: { text: 'se ejecuta con los permisos del dueño (ej. passwd).', inert: false },
    sgid: { text: 'se ejecuta con los permisos del grupo.', inert: false },
    sticky: { text: 'sin efecto en Linux moderno.', inert: true },
  },
  dir: {
    suid: { text: 'sin efecto en Linux.', inert: true },
    sgid: { text: 'lo creado dentro hereda el grupo de la carpeta.', inert: false },
    sticky: { text: 'solo el dueño de cada entrada puede borrarla (ej. /tmp).', inert: false },
  },
}

const PRESETS: { value: string; label: string; special?: boolean }[] = [
  { value: '644', label: '644 — Fichero normal (dueño escribe, resto lee)' },
  { value: '755', label: '755 — Ejecutable, o carpeta que todos pueden atravesar' },
  { value: '600', label: '600 — Privado (solo el dueño)' },
  { value: '700', label: '700 — Carpeta privada' },
  { value: '400', label: '400 — Solo lectura, ni el dueño escribe' },
  { value: '664', label: '664 — Compartido con el grupo' },
  { value: '775', label: '775 — Carpeta compartida con el grupo' },
  { value: '777', label: '777 — Todo a todos (no lo hagas)' },
  { value: '1777', label: '1777 — Carpeta tipo /tmp (sticky)', special: true },
  { value: '4755', label: '4755 — Binario setuid (ej. passwd)', special: true },
]

function hasSpecialBits(mode: number): boolean {
  return (mode & 0o7000) !== 0
}

function toOctalString(mode: number): string {
  return mode.toString(8).padStart(hasSpecialBits(mode) ? 4 : 3, '0')
}

function triplet(
  mode: number,
  r: number,
  w: number,
  x: number,
  special?: number,
  lower?: string,
  upper?: string,
): string {
  const rc = mode & r ? 'r' : '-'
  const wc = mode & w ? 'w' : '-'
  let xc: string
  if (special && mode & special) {
    xc = mode & x ? (lower as string) : (upper as string)
  } else {
    xc = mode & x ? 'x' : '-'
  }
  return `${rc}${wc}${xc}`
}

function toSymbolic(mode: number, target: Target): string {
  return (
    (target === 'dir' ? 'd' : '-') +
    triplet(mode, BITS.ur, BITS.uw, BITS.ux, BITS.suid, 's', 'S') +
    triplet(mode, BITS.gr, BITS.gw, BITS.gx, BITS.sgid, 's', 'S') +
    triplet(mode, BITS.or, BITS.ow, BITS.ox, BITS.sticky, 't', 'T')
  )
}

function parseInitialMode(initialMode: string | undefined): number {
  if (initialMode && OCTAL_MODE.test(initialMode)) {
    return parseInt(initialMode, 8)
  }
  return parseInt('644', 8)
}

export function ChmodCalculator({
  initialMode,
  initialTarget,
  showSpecial,
  title,
}: {
  initialMode?: string
  initialTarget?: Target | null
  showSpecial?: boolean | null
  title?: string
}) {
  // Determinista: sin useEffect. El primer render de cliente coincide con el
  // del servidor porque se deriva de las props, no de un efecto posterior.
  const [mode, setMode] = useState(() => parseInitialMode(initialMode))
  const [octalDraft, setOctalDraft] = useState(() => toOctalString(mode))
  const [target, setTarget] = useState<Target>(initialTarget === 'dir' ? 'dir' : 'file')
  const idPrefix = useId()

  function applyMode(next: number) {
    setMode(next)
    setOctalDraft(toOctalString(next))
  }

  function toggleBit(bit: number) {
    applyMode(mode ^ bit)
  }

  function handleOctalChange(raw: string) {
    setOctalDraft(raw)
    if (OCTAL_MODE.test(raw)) {
      applyMode(parseInt(raw, 8))
    }
  }

  function handleOctalBlur() {
    // Si quedó a medio escribir (inválido), no lo dejamos huérfano: vuelve a
    // reflejar el último `mode` válido, que es lo que el resto del widget ya
    // muestra (simbólico, comando, casillas).
    setOctalDraft(toOctalString(mode))
  }

  const octal = toOctalString(mode)
  const symbolic = toSymbolic(mode, target)
  const exampleName = target === 'dir' ? 'carpeta/' : 'archivo.txt'
  const command = `chmod ${octal} ${exampleName}`
  const visiblePresets = PRESETS.filter((p) => !p.special || showSpecial)
  const matchedPreset = visiblePresets.find((p) => parseInt(p.value, 8) === mode)?.value ?? 'custom'

  return (
    <div className="ab-chmod">
      <p className="ab-chmod-title">{title || 'Calculadora de permisos chmod'}</p>

      <div className="ab-chmod-toolbar">
        <fieldset className="ab-chmod-target">
          <legend>Aplicar a</legend>
          <div className="ab-chmod-target-options">
            {(['file', 'dir'] as const).map((t) => {
              const id = `${idPrefix}-target-${t}`
              return (
                <label key={t} htmlFor={id} className="ab-chmod-target-option" data-active={target === t}>
                  <input
                    id={id}
                    type="radio"
                    name={`${idPrefix}-target`}
                    checked={target === t}
                    onChange={() => setTarget(t)}
                  />
                  <Ic name={t === 'dir' ? 'folder' : 'fileText'} size={14} sw={2} />
                  {t === 'dir' ? 'Carpeta' : 'Fichero'}
                </label>
              )
            })}
          </div>
        </fieldset>

        <fieldset className="ab-chmod-preset-field">
          <legend>Valores comunes</legend>
          <select
            id={`${idPrefix}-preset`}
            className="ab-chmod-preset"
            value={matchedPreset}
            onChange={(e) => {
              if (e.target.value !== 'custom') applyMode(parseInt(e.target.value, 8))
            }}
          >
            <option value="custom" disabled>
              Personalizado
            </option>
            {visiblePresets.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </fieldset>
      </div>

      <dl className="ab-chmod-legend">
        {(['r', 'w', 'x'] as const).map((perm) => (
          <div key={perm} className="ab-chmod-legend-item">
            <dt>{perm}</dt>
            <dd>{MEANINGS[target][perm]}</dd>
          </div>
        ))}
      </dl>

      <div className="ab-chmod-grid">
        {GROUPS.map((group) => (
          <fieldset key={group.key} className="ab-chmod-group">
            <legend>{group.label}</legend>
            {(['r', 'w', 'x'] as const).map((perm) => {
              const bit = group.bits[perm]
              const id = `${idPrefix}-${group.key}-${perm}`
              return (
                <label key={perm} htmlFor={id} className="ab-chmod-row">
                  <input
                    id={id}
                    type="checkbox"
                    checked={(mode & bit) !== 0}
                    onChange={() => toggleBit(bit)}
                  />
                  <b>{perm}</b>
                </label>
              )
            })}
          </fieldset>
        ))}

        {showSpecial && (
          <fieldset className="ab-chmod-group">
            <legend>Especiales</legend>
            {(Object.keys(SPECIAL_LABELS) as (keyof typeof SPECIAL_LABELS)[]).map((key) => {
              const bit = BITS[key]
              const id = `${idPrefix}-${key}`
              const info = SPECIAL_INFO[target][key]
              return (
                <label
                  key={key}
                  htmlFor={id}
                  className="ab-chmod-row"
                  data-inert={info.inert || undefined}
                >
                  <input
                    id={id}
                    type="checkbox"
                    checked={(mode & bit) !== 0}
                    onChange={() => toggleBit(bit)}
                  />
                  <b>{SPECIAL_LABELS[key]}</b>
                </label>
              )
            })}
          </fieldset>
        )}
      </div>

      <div className="ab-chmod-output" aria-live="polite">
        <label className="ab-chmod-octal-label" htmlFor={`${idPrefix}-octal`}>
          Octal
          <input
            id={`${idPrefix}-octal`}
            className="ab-chmod-octal-input"
            type="text"
            inputMode="numeric"
            value={octalDraft}
            onChange={(e) => handleOctalChange(e.target.value)}
            onBlur={handleOctalBlur}
            maxLength={4}
          />
        </label>
        <code className="ab-chmod-symbolic">{symbolic}</code>
        <code className="ab-chmod-cmd">{command}</code>
        <CopyButton code={command} className="ab-chmod-copy" />
      </div>

      {showSpecial && (
        <ul className="ab-chmod-foot">
          {(Object.keys(SPECIAL_LABELS) as (keyof typeof SPECIAL_LABELS)[]).map((key) => {
            const info = SPECIAL_INFO[target][key]
            return (
              <li key={key}>
                <b>{SPECIAL_LABELS[key]}</b> — {info.inert ? 'sin efecto aquí: ' : ''}
                {info.text}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
