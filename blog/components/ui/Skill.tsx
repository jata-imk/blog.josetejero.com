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
}: {
  label: string
  icon?: string
  color?: SkillColor
}) {
  return (
    <span className="ab-skill">
      {icon && (
        <span className="si" style={{ background: COLOR_BG[color] }}>
          {icon}
        </span>
      )}
      {label}
    </span>
  )
}
