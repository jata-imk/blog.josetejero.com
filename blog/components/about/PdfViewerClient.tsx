'use client'

import dynamic from 'next/dynamic'

// dynamic with ssr:false must live in a Client Component — using it in a Server
// Component causes a build error in Next.js App Router.
export const PdfViewer = dynamic(
  () => import('./PdfViewer').then(m => ({ default: m.PdfViewer })),
  { ssr: false, loading: () => <div style={{ minHeight: 320 }} /> },
)
