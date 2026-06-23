import 'server-only'
import { codeToHtml } from 'shiki'

export type LexicalChildNode = {
  type: string
  text?: string
  language?: string
  children?: LexicalChildNode[]
  fields?: {
    content?: string | { root?: { children?: LexicalChildNode[] } }
    blockType?: string
    language?: string
  }
}

/**
 * Resalta `code` en servidor con Shiki (tema oscuro) y devuelve solo el HTML
 * interior del `<code>`. Cae a HTML escapado si Shiki falla o el lenguaje no existe.
 * Fuente de verdad del resaltado según ADR 0008 (servidor, no cliente).
 */
export async function highlightCode(code: string, lang: string | undefined): Promise<string> {
  if (!code) return ''

  const language = normalizeLang(lang)

  try {
    const html = await codeToHtml(code, {
      lang: language,
      theme: 'github-dark',
    })
    return extractCodeContent(html)
  } catch {
    return escapeHtml(code)
  }
}

/**
 * Extrae el texto plano de un nodo `code` de Lexical. Soporta dos estructuras:
 *  - anidada: `code → line → token` (la real que serializa Lexical)
 *  - plana: hijos `text`/`linebreak`/`tab` directos (edge cases)
 * Recorre 2 niveles a propósito: una recursión genérica perdería la forma por líneas.
 */
export function extractCodeText(children: LexicalChildNode[]): string {
  const lines: string[] = []

  for (const child of children) {
    if (child.type === 'line') {
      let lineText = ''
      if (Array.isArray(child.children)) {
        for (const token of child.children) {
          if (token.type === 'tab') lineText += '\t'
          else if (typeof token.text === 'string') lineText += token.text
        }
      }
      lines.push(lineText)
    } else if (child.type === 'linebreak') {
      lines.push('')
    } else if (child.type === 'tab') {
      if (lines.length === 0) lines.push('')
      lines[lines.length - 1] += '\t'
    } else if (typeof child.text === 'string') {
      if (lines.length === 0) lines.push('')
      lines[lines.length - 1] += child.text
    }
  }

  return lines.join('\n')
}

/**
 * Recorre el árbol Lexical, resalta en servidor cada nodo `code` (incluidos los
 * anidados dentro de bloques como Callout) y devuelve un mapa
 * `texto-del-snippet → HTML resaltado`. El converter usa este mapa para emitir un
 * Client Component síncrono sin meter Shiki en el bundle del navegador.
 */
export async function highlightLexicalCode(
  root: { children?: LexicalChildNode[] } | null | undefined,
): Promise<Map<string, string>> {
  const snippets = new Map<string, string | undefined>()
  collectCodeNodes(root?.children ?? [], snippets)

  const result = new Map<string, string>()
  await Promise.all(
    [...snippets.entries()].map(async ([code, lang]) => {
      result.set(code, await highlightCode(code, lang))
    }),
  )
  return result
}

function collectCodeNodes(
  children: LexicalChildNode[],
  out: Map<string, string | undefined>,
): void {
  for (const node of children) {
    // Current format: type: 'code' with children structure
    if (node.type === 'code') {
      const text = extractCodeText(node.children ?? [])
      if (!out.has(text)) out.set(text, node.language)
    }
    // Legacy format: type: 'block' with fields.blockType: 'Code' and fields.content as string
    if (node.type === 'block' && node.fields?.blockType === 'Code') {
      const content = node.fields.content
      if (typeof content === 'string' && content && !out.has(content)) {
        out.set(content, node.fields.language)
      }
    }
    if (node.children) collectCodeNodes(node.children, out)
    const nested = node.fields?.content
    if (nested && typeof nested === 'object' && nested.root?.children) {
      collectCodeNodes(nested.root.children, out)
    }
  }
}

const langAlias: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  jsx: 'tsx',
  tsx: 'tsx',
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  yml: 'yaml',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  md: 'markdown',
  mdx: 'markdown',
  txt: 'text',
}

function normalizeLang(lang: string | undefined): string {
  if (!lang) return 'text'
  const clean = lang.toLowerCase().trim()
  return langAlias[clean] ?? clean
}

function extractCodeContent(html: string): string {
  const codeMatch = html.match(/<code[^>]*>([\s\S]*?)<\/code>/i)
  if (codeMatch) return codeMatch[1]
  return escapeHtml(html)
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
