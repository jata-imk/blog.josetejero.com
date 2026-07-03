import type { Metadata } from 'next'
import { Ic } from '../../../components/ui/Ic'
import { SkillChip } from '../../../components/ui/Skill'
import { PdfViewer } from '../../../components/about/PdfViewerClient'
import { ABOUT, EXPERIENCE, SKILLS } from '../../../components/about/content'

export const metadata: Metadata = {
  title: 'Sobre mí | josetejero.com',
  description: ABOUT.lead,
}

/* ── inline helpers ────────────────────────────────────────────── */

function TimelineItem({
  org,
  role,
  period,
  desc,
  active,
  last,
}: {
  org: string
  role: string
  period: string
  desc: string
  active: boolean
  last?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: active ? 'var(--grad)' : 'var(--bg)',
            border: active ? 'none' : '2px solid var(--line-2)',
            marginTop: 4,
            boxShadow: active ? '0 0 0 4px var(--blue-tint)' : 'none',
          }}
        />
        {!last && (
          <div style={{ width: 2, flex: 1, background: 'var(--line-2)', marginTop: 4 }} />
        )}
      </div>
      <div style={{ paddingBottom: 28 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--blue)' }}>{period}</div>
        <div style={{ fontSize: 17, fontWeight: 700, marginTop: 3 }}>
          {role}{' '}
          <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}>· {org}</span>
        </div>
        <p style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.55, marginTop: 6 }}>
          {desc}
        </p>
      </div>
    </div>
  )
}

/* ── page ─────────────────────────────────────────────────────── */

export default function AboutPage() {
  return (
    <>
      {/* hero */}
      <section className="wrap" style={{ paddingTop: 56, paddingBottom: 12 }}>
        <div
          className="about-hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 320px',
            gap: 44,
            alignItems: 'center',
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Sobre mí</div>
            <h1
              style={{
                fontSize: 44,
                fontWeight: 800,
                letterSpacing: '-.04em',
                lineHeight: 1.1,
              }}
            >
              {ABOUT.headline}
            </h1>
            <p
              style={{
                fontSize: 18.5,
                color: 'var(--ink-3)',
                lineHeight: 1.6,
                marginTop: 18,
              }}
            >
              {ABOUT.lead}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 26, flexWrap: 'wrap' }}>
              <a href={ABOUT.cv.url} download className="btn btn-grad">
                <Ic name="download" size={16} sw={2} />Descargar CV
              </a>
              <a
                href={ABOUT.social.github}
                className="btn btn-secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Ic name="github" size={16} sw={1.8} />Ver GitHub
              </a>
              <a href="mailto:jata.imk@hotmail.com" className="btn btn-secondary">
                <Ic name="mail" size={16} sw={2} />Contactar
              </a>
            </div>
          </div>

          {/* author card */}
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: 26,
                margin: '0 auto 14px',
                background: 'var(--grad)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--on-accent)',
                fontSize: 34,
                fontWeight: 800,
                boxShadow: 'var(--sh-btn-grad)',
              }}
            >
              {ABOUT.initials}
            </div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{ABOUT.name}</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 2 }}>
              {ABOUT.tagline}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
              <a
                href={ABOUT.social.github}
                className="icon-btn"
                aria-label="GitHub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Ic name="github" size={17} sw={1.8} />
              </a>
              <a
                href={ABOUT.social.twitter}
                className="icon-btn"
                aria-label="X / Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Ic name="twitter" size={17} sw={1.8} />
              </a>
              <a
                href={ABOUT.social.linkedin}
                className="icon-btn"
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Ic name="linkedin" size={17} sw={1.8} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* bio */}
      <section className="wrap-narrow" style={{ maxWidth: 760, paddingTop: 44 }}>
        <div className="ab-prose">
          {ABOUT.bio.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </section>

      {/* experience */}
      <section className="wrap-narrow" style={{ maxWidth: 760, paddingTop: 48 }}>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 750,
            letterSpacing: '-.03em',
            marginBottom: 24,
          }}
        >
          Experiencia
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {EXPERIENCE.map((item) => (
            <TimelineItem
              key={item.org}
              org={item.org}
              role={item.role}
              period={item.period}
              desc={item.desc}
              active={item.active}
              last={('last' in item && item.last) === true}
            />
          ))}
        </div>
      </section>

      {/* CV */}
      <section className="wrap-narrow" style={{ maxWidth: 760, paddingTop: 44 }}>
        <div
          className="card"
          style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 18 }}
        >
          <div
            style={{
              width: 52,
              height: 64,
              borderRadius: 9,
              background: 'var(--bg)',
              border: '1px solid var(--line-2)',
              display: 'grid',
              placeItems: 'center',
              color: 'var(--rose)',
              flexShrink: 0,
              boxShadow: 'var(--sh-1)',
            }}
          >
            <Ic name="fileText" size={24} sw={1.8} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Curriculum Vitae</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 2 }}>
              PDF · {ABOUT.cv.pages} páginas · actualizado {ABOUT.cv.updated}
            </div>
          </div>
          <a href={ABOUT.cv.url} download className="btn btn-secondary">
            <Ic name="download" size={15} sw={2} />Descargar PDF
          </a>
        </div>

        {/* custom PDF viewer */}
        <div style={{ marginTop: 16 }}>
          <PdfViewer url={ABOUT.cv.url} fileName="cv-jose-tejero.pdf" />
        </div>
      </section>

      {/* skills */}
      <section className="wrap-narrow" style={{ maxWidth: 760, paddingTop: 52, paddingBottom: 64 }}>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 750,
            letterSpacing: '-.03em',
            marginBottom: 6,
          }}
        >
          Skills
        </h2>
        <p style={{ fontSize: 15, color: 'var(--ink-3)', marginBottom: 26 }}>
          Herramientas con las que trabajo a diario, agrupadas por área.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {Object.entries(SKILLS).map(([group, items]) => (
            <div key={group}>
              <div className="ab-toc-title" style={{ marginBottom: 12 }}>{group}</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {items.map((skill) => (
                  <SkillChip
                    key={skill.name}
                    label={skill.name}
                    icon={skill.mark ?? skill.name.slice(0, 2).toUpperCase()}
                    iconHex={skill.color}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

    </>
  )
}
