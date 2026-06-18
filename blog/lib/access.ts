type AnyUser = { id: string | number; role?: string | null }

type AccessArgsLike = { req: { user?: AnyUser | null } }

function userRole({ req }: AccessArgsLike): string | null {
  const user = req.user as unknown as AnyUser | null
  return user?.role ?? null
}

export const isAdmin = ({ req }: AccessArgsLike): boolean =>
  userRole({ req }) === 'admin'

export const isEditor = ({ req }: AccessArgsLike): boolean =>
  userRole({ req }) === 'editor'

export const isAdminOrEditor = ({ req }: AccessArgsLike): boolean => {
  const role = userRole({ req })
  return role === 'admin' || role === 'editor'
}

export const isAdminOrCurrentUser = ({ req }: AccessArgsLike): boolean | { id: { equals: string | number } } => {
  if (!req.user) return false
  const user = req.user as unknown as AnyUser
  if (user.role === 'admin') return true
  return { id: { equals: user.id } }
}
