export const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png'] as const
export const MAX_AVATAR_SIZE_MB = 5
export const MAX_AVATAR_SIZE = MAX_AVATAR_SIZE_MB * 1024 * 1024

export function validateAvatar(file: File): string | null {
  if (!ACCEPTED_AVATAR_TYPES.some((type) => type === file.type)) {
    return 'Escolha uma imagem JPG ou PNG.'
  }

  if (file.size > MAX_AVATAR_SIZE) {
    return `A imagem deve ter no máximo ${MAX_AVATAR_SIZE_MB} MB.`
  }

  return null
}
