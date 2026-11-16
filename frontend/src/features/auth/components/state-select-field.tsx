import { authInputVariants } from '@/features/auth/components/auth-input-variants'
import { cn } from '@/lib/utils'
import { brazilianStates } from '@/shared/constants/brazilian-states'

export function StateSelectField() {
  const hintId = 'signup-state-hint'

  return (
    <div className="mt-[19px]">
      <label
        className="mb-2 block text-[11px] text-auth-label"
        htmlFor="signup-state"
      >
        Estado *
      </label>
      <select
        className={cn(
          authInputVariants({ size: 'md' }),
          'appearance-none [background-image:linear-gradient(45deg,transparent_50%,var(--auth-select-arrow)_50%),linear-gradient(135deg,var(--auth-select-arrow)_50%,transparent_50%)] bg-[position:calc(100%-18px)_21px,calc(100%-13px)_21px] bg-[size:5px_5px,5px_5px] bg-no-repeat pr-10',
        )}
        id="signup-state"
        name="state"
        autoComplete="address-level1"
        defaultValue=""
        aria-describedby={hintId}
        required
      >
        <option value="" disabled>
          Selecione
        </option>
        {brazilianStates.map(({ uf, name }) => (
          <option value={uf} key={uf}>
            {name}
          </option>
        ))}
      </select>
      <p
        className="my-2 text-[10px] leading-[1.6] text-auth-subtle"
        id={hintId}
      >
        Apenas bairro e cidade ficam públicos. Não pedimos seu endereço
        residencial.
      </p>
    </div>
  )
}
