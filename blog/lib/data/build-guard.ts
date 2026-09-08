import 'server-only'

/**
 * Build hermético (ADR 0033): cuando BUILD_WITHOUT_DB=1 (solo durante
 * `next build` en CI/Docker), los helpers de datos devuelven vacío sin
 * tocar Postgres. El stage runner del Dockerfile NO define esta variable,
 * así que en runtime el flag siempre es false y la app consulta la BD normal.
 * Las páginas prerenderizadas "vacías" se regeneran tras el deploy vía
 * POST /api/revalidate (warm-up del pipeline).
 */
export const BUILD_WITHOUT_DB = process.env.BUILD_WITHOUT_DB === '1'
