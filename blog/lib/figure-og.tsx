import 'server-only'
import path from 'node:path'
import { readFile } from 'node:fs/promises'
import { ImageResponse } from 'next/og'
import { figureAccessibleLabel, type ViewerFigure } from '@/lib/figures'
import { OG_BG, OG_GRAD, OG_INK, OG_INK_3, OG_LINE, OG_ON_ACCENT, OG_SIZE } from '@/lib/og-theme'
import { SITE_NAME } from '@/lib/seo'

async function localImageDataUrl(figure: ViewerFigure): Promise<string | null> {
  const filename = figure.socialFilename ?? figure.filename
  if (!filename) return null
  const mediaRoot = path.resolve(process.cwd(), 'media')
  const candidate = path.resolve(mediaRoot, path.basename(filename))
  if (path.dirname(candidate) !== mediaRoot) return null
  try {
    const bytes = await readFile(candidate)
    return `data:${figure.socialMimeType ?? figure.mimeType};base64,${bytes.toString('base64')}`
  } catch {
    return null
  }
}

export async function renderFigureOpenGraph(
  figure: ViewerFigure,
  position: number,
  parentTitle: string,
): Promise<ImageResponse> {
  const label = figureAccessibleLabel(figure, position)
  const imageSrc = await localImageDataUrl(figure)

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: OG_BG, fontFamily: 'sans-serif' }}>
        <div style={{ width: '100%', height: 14, backgroundImage: OG_GRAD }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '34px 52px 24px', borderBottom: `2px solid ${OG_LINE}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 54, height: 54, borderRadius: 15, backgroundImage: OG_GRAD, color: OG_ON_ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800 }}>J</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: OG_INK, fontSize: 25, fontWeight: 750 }}>{SITE_NAME}</span>
              <span style={{ color: OG_INK_3, fontSize: 19 }}>{parentTitle}</span>
            </div>
          </div>
          <span style={{ color: OG_INK_3, fontSize: 21 }}>Figura {position}</span>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 52px 18px' }}>
          {imageSrc ? (
            <img src={imageSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', borderRadius: 22, backgroundImage: OG_GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', color: OG_ON_ACCENT, fontSize: 46, fontWeight: 800, textAlign: 'center', padding: 60 }}>{label}</div>
          )}
        </div>
        <div style={{ padding: '14px 52px 26px', color: OG_INK, fontSize: 25, fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      </div>
    ),
    { ...OG_SIZE },
  )
}
