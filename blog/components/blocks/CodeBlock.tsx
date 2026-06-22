import { highlightCode } from '@/lib/code-highlight'
import { CodeBlockClient } from './CodeBlockClient'

export async function CodeBlock({
  lang,
  code,
}: {
  lang?: string
  code?: string
}) {
  const text = code ?? ''
  const html = await highlightCode(text, lang)
  return <CodeBlockClient lang={lang} code={text} html={html} />
}
