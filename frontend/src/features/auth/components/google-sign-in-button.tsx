import { AuthButton } from '@/features/auth/components/auth-button'

export function GoogleSignInButton({ onClick }: { onClick: () => void }) {
  return (
    <AuthButton
      className="mt-[15px] gap-[11px] px-[17px] text-[13px] font-medium"
      variant="social"
      type="button"
      onClick={onClick}
    >
      <GoogleIcon />
      <span>Faça login com Google</span>
    </AuthButton>
  )
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.09-1.92 3.27-4.76 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.99 0 5.49-.99 7.32-2.68l-3.57-2.77c-.99.66-2.25 1.05-3.75 1.05-2.88 0-5.32-1.95-6.19-4.57H2.12v2.85A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.81 14.04A6.62 6.62 0 0 1 5.47 12c0-.71.12-1.4.34-2.04V7.11H2.12A11 11 0 0 0 1 12c0 1.78.43 3.46 1.19 4.89l3.62-2.85Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.56 10.56 0 0 0 12 1a11 11 0 0 0-9.88 6.11l3.69 2.85C6.68 7.33 9.12 5.38 12 5.38Z"
      />
    </svg>
  )
}
