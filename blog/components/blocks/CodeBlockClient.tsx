'use client'

import { useEffect, useState } from 'react'
import { CopyButton } from './CopyButton'
import { highlightCodeClient } from '@/lib/code-highlight-client'

export function CodeBlockClient({
  lang,
  code,
  html: initialHtml,
}: {
  lang?: string
  code: string
  html: string
}) {
  const [html, setHtml] = useState(initialHtml)

  useEffect(() => {
    // Only highlight if we have code and initial HTML is just escaped fallback
    if (code && initialHtml) {
      highlightCodeClient(code, lang)
        .then(setHtml)
        .catch(() => {
          // Keep the fallback HTML if highlighting fails
        })
    }
  }, [code, lang, initialHtml])

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
