'use client'

/**
 * Client-side code highlighting using Shiki.
 * Fallback to escaped HTML if highlighting fails or Shiki isn't available.
 */

export async function highlightCodeClient(
  code: string,
  lang: string | undefined,
): Promise<string> {
  if (!code) return ''

  const language = normalizeLang(lang)

  try {
    // Dynamically import Shiki for client-side usage
    const { codeToHtml } = await import('shiki')

    const html = await codeToHtml(code, {
      lang: language,
      theme: 'github-dark',
    })

    return extractCodeContent(html)
  } catch (error) {
    // Fallback to plain escaped HTML if Shiki fails or isn't available
    console.warn('Code highlighting failed, using fallback:', error)
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
