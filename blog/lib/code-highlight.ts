import 'server-only'
import { codeToHtml } from 'shiki'

export type LexicalChildNode = {
  type: string
  text?: string
  language?: string
  children?: LexicalChildNode[]
  fields?: {
    /** Código del bloque `Code` premade de Payload (string). */
    code?: string
    /** Contenido richText anidado (p. ej. el del Callout). */
    content?: { root?: { children?: LexicalChildNode[] } }
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
 * Recorre el árbol Lexical, resalta en servidor cada bloque `Code` (incluidos los
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
    // Bloque `Code` (premade de Payload): el código vive como string en `fields.code`.
    if (node.type === 'block' && node.fields?.blockType === 'Code') {
      const code = node.fields.code
      if (typeof code === 'string' && code && !out.has(code)) {
        out.set(code, node.fields.language)
      }
    }
    if (node.children) collectCodeNodes(node.children, out)
    // Contenido richText anidado (p. ej. el del Callout) puede contener más bloques `Code`.
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
