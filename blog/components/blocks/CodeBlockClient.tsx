'use client'

import { CopyButton } from './CopyButton'

export function CodeBlockClient({
  lang,
  code,
  html,
}: {
  lang?: string
  code: string
  html: string
}) {
  return (
    <div className="ab-code">
      <div className="ab-code-bar">
        <div className="ab-code-dots">
          <i style={{ background: 'var(--mac-red)' }} />
          <i style={{ background: 'var(--mac-amber)' }} />
          <i style={{ background: 'var(--mac-green)' }} />
        </div>
        {lang && <span className="ab-code-lang">{lang}</span>}
        <CopyButton code={code} />
      </div>
      <pre tabIndex={0}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}
