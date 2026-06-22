import { highlightCode } from '@/lib/code-highlight'
import { CopyButton } from './CopyButton'

export async function CodeBlock({
  lang,
  code,
}: {
  lang?: string
  code?: string
}) {
  const text = code ?? ''
  const html = await highlightCode(text, lang)

  return (
    <div className="ab-code">
      <div className="ab-code-bar">
        <div className="ab-code-dots">
          <i style={{ background: 'var(--mac-red)' }} />
          <i style={{ background: 'var(--mac-amber)' }} />
          <i style={{ background: 'var(--mac-green)' }} />
        </div>
        {lang && <span className="ab-code-lang">{lang}</span>}
        <CopyButton code={text} />
      </div>
      <pre>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}
