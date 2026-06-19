'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Ic } from '../ui/Ic'

export function CodeBlock({
  lang,
  code,
  children,
}: {
  lang?: string
  code?: string
  children?: ReactNode
}) {
  const [copied, setCopied] = useState(false)

  function copy() {
    const text = code ?? ''
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="ab-code">
      <div className="ab-code-bar">
        <div className="ab-code-dots">
          <i style={{ background: '#ff5f57' }} />
          <i style={{ background: '#febc2e' }} />
          <i style={{ background: '#28c840' }} />
        </div>
        {lang && <span className="ab-code-lang">{lang}</span>}
        <button
          className="ab-code-copy"
          onClick={copy}
          aria-label={copied ? 'Copiado' : 'Copiar código'}
          style={{ marginLeft: 'auto' }}
        >
          <Ic name={copied ? 'check2' : 'copy'} size={13} sw={2} />
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre>
        {children ?? <code>{code}</code>}
      </pre>
    </div>
  )
}
