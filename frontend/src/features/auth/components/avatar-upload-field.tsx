import { useState, type ChangeEvent } from 'react'
import { Camera } from 'lucide-react'

import {
  ACCEPTED_AVATAR_TYPES,
  MAX_AVATAR_SIZE_MB,
  validateAvatar,
} from '@/features/auth/lib/validate-avatar'

export function AvatarUploadField() {
  const [photoName, setPhotoName] = useState('')
  const [photoError, setPhotoError] = useState('')

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    setPhotoName('')
    setPhotoError('')

    if (!file) return

    const error = validateAvatar(file)

    if (error) {
      event.target.value = ''
      setPhotoError(error)
      return
    }

    setPhotoName(file.name)
  }

  return (
    <>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-auth-soft-surface p-3 text-xs text-auth-label transition hover:bg-auth-soft-hover focus-within:ring-2 focus-within:ring-auth-focus/30">
        <Camera aria-hidden="true" className="size-7 shrink-0" />
        <span className="min-w-0">
          Adicionar foto · opcional
          <small className="mt-1 block text-[10px] text-auth-subtle">
            JPG ou PNG, até {MAX_AVATAR_SIZE_MB} MB. Pode ser depois.
          </small>
          {photoName ? (
            <small className="mt-1 block truncate text-[10px] font-semibold text-auth-accent">
              {photoName}
            </small>
          ) : null}
        </span>
        <input
          className="sr-only"
          type="file"
          name="photo"
          accept={ACCEPTED_AVATAR_TYPES.join(',')}
          onChange={handlePhotoChange}
          aria-describedby={photoError ? 'photo-error' : undefined}
          aria-invalid={photoError ? true : undefined}
        />
      </label>
      {photoError ? (
        <p
          className="mt-2 mb-0 text-[11px] text-auth-danger"
          id="photo-error"
          role="alert"
        >
          {photoError}
        </p>
      ) : null}
    </>
  )
}
