export type CatInfo = { name: string; slug: string }

export function Cat({ name, slug, lg }: CatInfo & { lg?: boolean }) {
  return (
    <span className={`cat-pill${lg ? ' cat-pill-lg' : ''}`} data-cat={slug}>
      <span className="dot" />
      {name}
    </span>
  )
}
