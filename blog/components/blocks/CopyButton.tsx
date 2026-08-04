'use client'

import { useState } from 'react'
import { Ic } from '../ui/Ic'

export function CopyButton({
  code,
  className = 'ab-code-copy',
}: {
  code: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      className={className}
      onClick={copy}
      aria-label={copied ? 'Copiado' : 'Copiar código'}
    >
      <Ic name={copied ? 'check2' : 'copy'} size={13} sw={2} />
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}
