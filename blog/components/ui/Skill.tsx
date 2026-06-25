type SkillColor = 'blue' | 'violet' | 'cyan' | 'green' | 'amber'

const COLOR_BG: Record<SkillColor, string> = {
  blue:   'var(--blue)',
  violet: 'var(--violet)',
  cyan:   'var(--cyan)',
  green:  'var(--green)',
  amber:  'var(--amber)',
}

export function SkillChip({
  label,
  icon,
  color = 'blue',
  iconHex,
}: {
  label: string
  icon?: string
  color?: SkillColor
  /** Brand hex for external tech icons — overrides semantic color when provided */
  iconHex?: string
}) {
  const iconBg = iconHex ?? COLOR_BG[color]
  return (
    <span className="ab-skill">
      {icon && (
        <span className="si" style={{ background: iconBg }}>
          {icon}
        </span>
      )}
      {label}
    </span>
  )
}
