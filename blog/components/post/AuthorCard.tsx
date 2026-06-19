export function AuthorCard({
  name,
  bio,
  initials,
}: {
  name: string
  bio?: string
  initials?: string
}) {
  const abbr = initials ?? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="ab-author">
      <div className="ab-author-av" aria-hidden="true">{abbr}</div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15.5, color: 'var(--ink)' }}>{name}</div>
        {bio && (
          <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 3 }}>
            {bio}
          </p>
        )}
      </div>
    </div>
  )
}
