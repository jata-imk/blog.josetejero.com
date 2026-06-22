import 'server-only'
import { codeToHtml } from 'shiki'

export async function highlightCode(
  code: string,
  lang: string | undefined,
): Promise<string> {
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
