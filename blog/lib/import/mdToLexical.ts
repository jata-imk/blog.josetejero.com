/**
 * Converter Markdown → árbol Lexical (Payload v3 / richtext-lexical).
 *
 * Replica exactamente las formas de nodo de lib/seed.ts:makeBody y las validas
 * contra Post['body']. Soporta: heading, paragraph, bold/italic/strikethrough/
 * inlineCode, link, ul/ol, code fence, blockquote, horizontalrule, asides
 * <aside class="bg-*"> (→ bloque callout), imágenes inline (→ nodo upload).
 *
 * ADR 0024 / ADR 0023.
 */

import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'

// Idiomas válidos del CodeBlock premade (defaultLanguages de @payloadcms/richtext-lexical).
// Cualquier valor fuera de este set se mapea a 'plaintext'.
const VALID_LANGUAGES = new Set([
  'abap','apex','azcli','bat','bicep','cameligo','clojure','coffee','cpp','csharp','csp',
  'css','cypher','dart','dockerfile','ecl','elixir','flow9','freemarker2','fsharp','go',
  'graphql','handlebars','hcl','html','ini','java','javascript','julia','kotlin','less',
  'lexon','liquid','lua','m3','markdown','mdx','mips','msdax','mysql','objective-c','pascal',
  'pascaligo','perl','pgsql','php','pla','plaintext','postiats','powerquery','powershell',
  'protobuf','pug','python','qsharp','r','razor','redis','redshift','restructuredtext',
  'ruby','rust','sb','scala','scheme','scss','shell','solidity','sophia','sparql','sql','st',
  'swift','systemverilog','tcl','twig','typescript','typespec','vb','wgsl','xml','yaml',
])

// Alias comunes que remark/GitHub usan pero que el CodeBlock no reconoce
const LANGUAGE_ALIASES: Record<string, string> = {
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  console: 'shell',
  terminal: 'shell',
  cmd: 'bat',
  ps1: 'powershell',
  ts: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  tsx: 'typescript',
  json: 'plaintext',
  text: 'plaintext',
  txt: 'plaintext',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  cs: 'csharp',
  fs: 'fsharp',
  kt: 'kotlin',
  md: 'markdown',
  yml: 'yaml',
}

function normalizeLanguage(lang: string | null | undefined): string {
  if (!lang) return 'plaintext'
  const lower = lang.toLowerCase()
  const aliased = LANGUAGE_ALIASES[lower] ?? lower
  return VALID_LANGUAGES.has(aliased) ? aliased : 'plaintext'
}
import type {
  Root,
  Content,
  Heading,
  Paragraph,
  Text,
  Strong,
  Emphasis,
  Delete as MdastDelete,
  InlineCode,
  Link,
  Image,
  List,
  ListItem,
  Code,
  Blockquote,
  ThematicBreak,
  Html,
  PhrasingContent,
  Table,
  TableRow,
  TableCell,
} from 'mdast'

// ---------------------------------------------------------------------------
// Tipos de nodo Lexical (solo lo necesario; no importamos desde payload-types
// para mantener este módulo ligero y ejecutable en server/endpoint).
// ---------------------------------------------------------------------------

type LexicalText = {
  type: 'text'
  text: string
  version: 1
  format: number
  style: ''
  mode: 'normal'
  detail: 0
}

type LexicalLink = {
  type: 'link'
  version: 3
  fields: { linkType: 'custom'; url: string; newTab: boolean }
  children: LexicalInline[]
  direction: 'ltr'
  format: ''
  indent: 0
}

type LexicalInline = LexicalText | LexicalLink

type LexicalHeading = {
  type: 'heading'
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  version: 1
  children: LexicalInline[]
  direction: 'ltr'
  format: ''
  indent: 0
}

type LexicalParagraph = {
  type: 'paragraph'
  version: 1
  children: LexicalInline[]
  direction: 'ltr'
  format: ''
  indent: 0
  textFormat: 0
}

type LexicalListItem = {
  type: 'listitem'
  version: 1
  value: number
  children: LexicalInline[]
  direction: 'ltr'
  format: ''
  indent: 0
}

type LexicalList = {
  type: 'list'
  listType: 'bullet' | 'number'
  tag: 'ul' | 'ol'
  start: 1
  version: 1
  children: LexicalListItem[]
  direction: 'ltr'
  format: ''
  indent: 0
}

type LexicalBlock = {
  type: 'block'
  version: 2
  format: ''
  fields: Record<string, unknown>
}

type LexicalBlockquote = {
  type: 'quote'
  version: 1
  children: LexicalInline[]
  direction: 'ltr'
  format: ''
  indent: 0
}

type LexicalHRule = {
  type: 'horizontalrule'
  version: 1
}

type LexicalUpload = {
  type: 'upload'
  version: 3
  format: ''
  id: string
  relationTo: 'media'
  value: number
  fields: Record<string, never>
}

// TableCellHeaderStates de @lexical/table: NO_STATUS=0, ROW=1, COLUMN=2, BOTH=3.
// El converter de Payload solo distingue `headerState > 0` (th) vs `0` (td),
// así que usamos COLUMN(2) para marcar la fila de encabezado GFM.
type LexicalTableCell = {
  type: 'tablecell'
  version: 1
  headerState: number
  colSpan: 1
  rowSpan: 1
  backgroundColor: null
  children: LexicalParagraph[]
  direction: 'ltr' | null
  format: ''
  indent: 0
}

type LexicalTableRow = {
  type: 'tablerow'
  version: 1
  children: LexicalTableCell[]
  direction: 'ltr' | null
  format: ''
  indent: 0
}

type LexicalTable = {
  type: 'table'
  version: 1
  children: LexicalTableRow[]
  rowStriping: false
  frozenColumnCount: 0
  frozenRowCount: 0
  direction: 'ltr' | null
  format: ''
  indent: 0
}

type LexicalNode =
  | LexicalHeading
  | LexicalParagraph
  | LexicalList
  | LexicalBlock
  | LexicalBlockquote
  | LexicalHRule
  | LexicalUpload
  | LexicalTable

// ---------------------------------------------------------------------------
// Tipos de reporte
// ---------------------------------------------------------------------------

export type ImportReport = {
  imagesUploaded: string[]
  imagesFailed: string[]
  asides: number
  nodesDropped: string[]
}

export type MdToLexicalResult = {
  body: {
    root: {
      type: 'root'
      format: ''
      indent: 0
      version: 1
      direction: 'ltr'
      children: LexicalNode[]
    }
  }
  frontmatter: Record<string, unknown>
  report: ImportReport
}

// ---------------------------------------------------------------------------
// Colores de aside → variant de callout
// ---------------------------------------------------------------------------

const ASIDE_COLORS: Array<[RegExp, 'note' | 'tip' | 'warning' | 'danger']> = [
  [/bg-blue-/i, 'note'],
  [/bg-emerald-/i, 'tip'],
  [/bg-amber-/i, 'warning'],
  [/bg-red-|bg-rose-/i, 'danger'],
]

function asideVariant(className: string): 'note' | 'tip' | 'warning' | 'danger' {
  for (const [re, variant] of ASIDE_COLORS) {
    if (re.test(className)) return variant
  }
  return 'note'
}

// ---------------------------------------------------------------------------
// Extraer asides del raw MD antes de remark-parse
// Los asides son HTML raw que remark trataría como nodos `html` sueltos.
// Estrategia: reemplazarlos con marcadores únicos, parseamos el MD sin ellos,
// y luego los insertamos en las posiciones correctas.
// ---------------------------------------------------------------------------

type AsidePlaceholder = {
  marker: string
  variant: 'note' | 'tip' | 'warning' | 'danger'
  innerMd: string
}

/**
 * Extrae todos los <aside class="bg-...">...</aside> del MD y los sustituye
 * por marcadores tipo `<!--ASIDE-0-->`.
 */
function extractAsides(raw: string): { processedMd: string; asides: AsidePlaceholder[] } {
  const asides: AsidePlaceholder[] = []
  const asideRe = /<aside\s+class="([^"]+)">([\s\S]*?)<\/aside>/gi
  const processedMd = raw.replace(asideRe, (_match, className: string, inner: string) => {
    const idx = asides.length
    asides.push({
      marker: `<!--ASIDE-${idx}-->`,
      variant: asideVariant(className),
      innerMd: inner.trim(),
    })
    return `<!--ASIDE-${idx}-->`
  })
  return { processedMd, asides }
}

// ---------------------------------------------------------------------------
// Helpers de formato de texto (bitmask Lexical)
// bold=1, italic=2, strikethrough=4, underline=8, subscript=16, superscript=32, code=64
// Nota: InlineCode de mdast → format 64 (code inline)
// ---------------------------------------------------------------------------

const FORMAT_BOLD = 1
const FORMAT_ITALIC = 2
const FORMAT_STRIKETHROUGH = 4
const FORMAT_CODE = 16   // Lexical usa 16 para inline code (no el estándar 64 de remark)

function makeText(text: string, format = 0): LexicalText {
  return {
    type: 'text',
    text,
    version: 1,
    format,
    style: '',
    mode: 'normal',
    detail: 0,
  }
}

// ---------------------------------------------------------------------------
// Walker recursivo de nodos inline de mdast → LexicalInline[]
// ---------------------------------------------------------------------------

function walkInline(nodes: PhrasingContent[], inheritFormat = 0): LexicalInline[] {
  const result: LexicalInline[] = []

  for (const node of nodes) {
    switch (node.type) {
      case 'text': {
        const t = node as Text
        if (t.value) result.push(makeText(t.value, inheritFormat))
        break
      }
      case 'strong': {
        const s = node as Strong
        result.push(...walkInline(s.children as PhrasingContent[], inheritFormat | FORMAT_BOLD))
        break
      }
      case 'emphasis': {
        const e = node as Emphasis
        result.push(...walkInline(e.children as PhrasingContent[], inheritFormat | FORMAT_ITALIC))
        break
      }
      case 'delete': {
        const d = node as MdastDelete
        result.push(...walkInline(d.children as PhrasingContent[], inheritFormat | FORMAT_STRIKETHROUGH))
        break
      }
      case 'inlineCode': {
        const ic = node as InlineCode
        result.push(makeText(ic.value, FORMAT_CODE))
        break
      }
      case 'link': {
        const l = node as Link
        const isExternal = /^https?:\/\//i.test(l.url) || l.url.startsWith('//')
        result.push({
          type: 'link',
          version: 3,
          fields: {
            linkType: 'custom',
            url: l.url,
            newTab: isExternal,
          },
          children: walkInline(l.children as PhrasingContent[], inheritFormat),
          direction: 'ltr',
          format: '',
          indent: 0,
        })
        break
      }
      case 'image': {
        // Imágenes inline dentro de párrafos se manejan en el walker de bloques
        // Si llegan aquí (ej. párrafo mixto texto+imagen) ignoramos — el walker
        // de bloques las sacó antes. Fallback: alt como texto.
        const img = node as Image
        if (img.alt) result.push(makeText(`[${img.alt}]`, inheritFormat))
        break
      }
      case 'break': {
        result.push(makeText('\n', inheritFormat))
        break
      }
      default:
        break
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Walker de bloques mdast → LexicalNode[]
// ---------------------------------------------------------------------------

async function walkBlock(
  nodes: Content[],
  report: ImportReport,
  uploadImage: ((src: string) => Promise<number | null>) | undefined,
): Promise<LexicalNode[]> {
  const result: LexicalNode[] = []

  for (const node of nodes) {
    switch (node.type) {
      case 'heading': {
        const h = node as Heading
        const tag = `h${h.depth}` as LexicalHeading['tag']
        result.push({
          type: 'heading',
          tag,
          version: 1,
          children: walkInline(h.children as PhrasingContent[]),
          direction: 'ltr',
          format: '',
          indent: 0,
        })
        break
      }

      case 'paragraph': {
        const p = node as Paragraph
        // Un párrafo puede contener una imagen sola → nodo upload
        if (p.children.length === 1 && p.children[0].type === 'image') {
          const img = p.children[0] as Image
          const uploadNode = await handleImage(img, report, uploadImage)
          if (uploadNode) {
            result.push(uploadNode)
          } else {
            // Degradar: párrafo con el texto alt
            result.push(makeParagraph([makeText(img.alt ?? img.url)]))
          }
          break
        }
        // Párrafo mixto — las imágenes dentro quedan como texto alt (ya manejado en walkInline)
        result.push(makeParagraph(walkInline(p.children as PhrasingContent[])))
        break
      }

      case 'list': {
        const l = node as List
        const ordered = l.ordered ?? false
        const items: LexicalListItem[] = []
        let counter = 1
        for (const item of l.children) {
          const li = item as ListItem
          // Extraer inlines del contenido del listItem (ignorar sub-listas por ahora)
          const inlines: LexicalInline[] = []
          for (const child of li.children) {
            if (child.type === 'paragraph') {
              inlines.push(...walkInline((child as Paragraph).children as PhrasingContent[]))
            }
          }
          items.push({
            type: 'listitem',
            version: 1,
            value: counter++,
            children: inlines,
            direction: 'ltr',
            format: '',
            indent: 0,
          })
        }
        result.push({
          type: 'list',
          listType: ordered ? 'number' : 'bullet',
          tag: ordered ? 'ol' : 'ul',
          start: 1,
          version: 1,
          children: items,
          direction: 'ltr',
          format: '',
          indent: 0,
        })
        break
      }

      case 'code': {
        const c = node as Code
        result.push({
          type: 'block',
          version: 2,
          format: '',
          fields: {
            id: crypto.randomUUID(),
            blockName: '',
            blockType: 'Code',
            language: normalizeLanguage(c.lang),
            code: c.value,
          },
        })
        break
      }

      case 'blockquote': {
        const bq = node as Blockquote
        // Extraer inlines de todos los párrafos del blockquote
        const inlines: LexicalInline[] = []
        for (const child of bq.children) {
          if (child.type === 'paragraph') {
            if (inlines.length > 0) inlines.push(makeText(' '))
            inlines.push(...walkInline((child as Paragraph).children as PhrasingContent[]))
          }
        }
        result.push({
          type: 'quote',
          version: 1,
          children: inlines,
          direction: 'ltr',
          format: '',
          indent: 0,
        })
        break
      }

      case 'thematicBreak': {
        void (node as ThematicBreak)
        result.push({ type: 'horizontalrule', version: 1 })
        break
      }

      case 'table': {
        const t = node as Table
        result.push(walkTable(t))
        break
      }

      case 'html': {
        const h = node as Html
        // Los asides ya se extrajeron y reemplazaron por marcadores <!--ASIDE-N-->.
        // Este nodo Html en este punto es otro HTML raw que no sabemos manejar → drop.
        if (!h.value.startsWith('<!--ASIDE-')) {
          report.nodesDropped.push(`html: ${h.value.slice(0, 60)}`)
        }
        break
      }

      default:
        break
    }
  }

  return result
}

const HEADER_STATE_NONE = 0
const HEADER_STATE_COLUMN = 2

// Convierte una tabla GFM (mdast `table`) a un nodo Lexical `table`.
// Convención GFM: la primera fila es siempre el encabezado.
function walkTable(table: Table): LexicalTable {
  const rows = table.children as TableRow[]
  const lexicalRows: LexicalTableRow[] = rows.map((row, rowIndex) => {
    const isHeaderRow = rowIndex === 0
    const cells = row.children as TableCell[]
    const lexicalCells: LexicalTableCell[] = cells.map((cell) => ({
      type: 'tablecell',
      version: 1,
      headerState: isHeaderRow ? HEADER_STATE_COLUMN : HEADER_STATE_NONE,
      colSpan: 1,
      rowSpan: 1,
      backgroundColor: null,
      children: [makeParagraph(walkInline(cell.children as PhrasingContent[]))],
      direction: 'ltr',
      format: '',
      indent: 0,
    }))
    return {
      type: 'tablerow',
      version: 1,
      children: lexicalCells,
      direction: 'ltr',
      format: '',
      indent: 0,
    }
  })

  return {
    type: 'table',
    version: 1,
    children: lexicalRows,
    rowStriping: false,
    frozenColumnCount: 0,
    frozenRowCount: 0,
    direction: 'ltr',
    format: '',
    indent: 0,
  }
}

function makeParagraph(children: LexicalInline[]): LexicalParagraph {
  return {
    type: 'paragraph',
    version: 1,
    children: children.length > 0 ? children : [makeText('')],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
  }
}

async function handleImage(
  img: Image,
  report: ImportReport,
  uploadImage: ((src: string) => Promise<number | null>) | undefined,
): Promise<LexicalUpload | null> {
  if (!uploadImage) {
    report.imagesFailed.push(img.url)
    return null
  }
  try {
    const mediaId = await uploadImage(img.url)
    if (mediaId == null) {
      report.imagesFailed.push(img.url)
      return null
    }
    report.imagesUploaded.push(img.url)
    return {
      type: 'upload',
      version: 3,
      format: '',
      id: crypto.randomUUID(),
      relationTo: 'media',
      value: mediaId,
      fields: {},
    }
  } catch {
    report.imagesFailed.push(img.url)
    return null
  }
}

// ---------------------------------------------------------------------------
// Convertir un aside (markdown interno) al bloque callout Lexical
// ---------------------------------------------------------------------------

async function asideToCallout(
  placeholder: AsidePlaceholder,
  report: ImportReport,
  uploadImage: ((src: string) => Promise<number | null>) | undefined,
): Promise<LexicalBlock> {
  report.asides++

  // Parsear el interior del aside como MD normal
  const innerAst = unified().use(remarkParse).use(remarkGfm).parse(placeholder.innerMd) as Root

  // El calloutBlock.content usa lexicalEditor() bare → NO tiene BlocksFeature
  // ni EXPERIMENTAL_TableFeature. Solo soporta nodos built-in: paragraph,
  // heading, list, link, blockquote, horizontalrule. Code fences y tablas
  // dentro de aside no son válidos ahí y se dropean (reportado).
  const innerChildren = await walkBlock(innerAst.children as Content[], report, uploadImage)

  // Advertir si hay bloques Code o tablas dentro (no soportados en callout.content)
  for (const node of innerChildren) {
    if (node.type === 'block') {
      report.nodesDropped.push('bloque Code dentro de aside (degradado a párrafo)')
    }
    if (node.type === 'table') {
      report.nodesDropped.push('tabla dentro de aside (no soportada en callout.content)')
    }
  }

  // Filtrar bloques Code y tablas del content (no válidos ahí)
  const validChildren = innerChildren.filter(
    (n) => n.type !== 'block' && n.type !== 'table',
  ) as (LexicalParagraph | LexicalHeading | LexicalList | LexicalBlockquote | LexicalHRule)[]

  return {
    type: 'block',
    version: 2,
    format: '',
    fields: {
      id: crypto.randomUUID(),
      blockName: '',
      blockType: 'callout',
      variant: placeholder.variant,
      content: {
        root: {
          type: 'root',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: validChildren.length > 0 ? validChildren : [makeParagraph([makeText('')])],
        },
      },
    },
  }
}

// ---------------------------------------------------------------------------
// Función principal exportada
// ---------------------------------------------------------------------------

/**
 * Convierte un string Markdown a un árbol Lexical compatible con Post['body'].
 *
 * @param md     Contenido Markdown (con o sin frontmatter YAML).
 * @param opts   Opcional: `uploadImage(src)` → id del documento Media creado.
 *               Si se omite, las imágenes se reportan como fallidas y se
 *               degradan a texto.
 */
export async function mdToLexicalBody(
  md: string,
  opts?: {
    uploadImage?: (src: string) => Promise<number | null>
  },
): Promise<MdToLexicalResult> {
  const report: ImportReport = {
    imagesUploaded: [],
    imagesFailed: [],
    asides: 0,
    nodesDropped: [],
  }

  // 1. Separar frontmatter
  const { content: rawBody, data: frontmatter } = matter(md)

  // 2. Extraer asides antes de parsear (HTML raw que remark no entiende bien)
  const { processedMd, asides } = extractAsides(rawBody)

  // 3. Parsear MD a mdast (remarkGfm habilita tablas, strikethrough, autolinks, etc.)
  const ast = unified().use(remarkParse).use(remarkGfm).parse(processedMd) as Root

  // 4. Walk → nodos Lexical (los asides son placeholders Html en el AST)
  const children: LexicalNode[] = []
  for (const node of ast.children as Content[]) {
    if (node.type === 'html') {
      const h = node as Html
      // Detectar marcadores de aside
      const match = h.value.match(/<!--ASIDE-(\d+)-->/)
      if (match) {
        const idx = Number(match[1])
        if (asides[idx]) {
          const callout = await asideToCallout(asides[idx], report, opts?.uploadImage)
          children.push(callout)
          continue
        }
      }
    }
    // Nodo normal
    const converted = await walkBlock([node], report, opts?.uploadImage)
    children.push(...converted)
  }

  return {
    body: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children,
      },
    },
    frontmatter,
    report,
  }
}
