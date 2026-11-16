import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type FieldValues, type UseFormProps } from 'react-hook-form'
import type { z } from 'zod'

type UseZodFormProps<
  TInput extends FieldValues,
  TOutput extends FieldValues,
> = Omit<UseFormProps<TInput, unknown, TOutput>, 'resolver'>

/**
 * `useForm` já ligado a um schema do Zod.
 *
 * Os tipos do formulário vêm do schema: `z.input` para os valores dos campos
 * e `z.output` para o que chega no `handleSubmit` (já transformado/coagido).
 */
export function useZodForm<
  TOutput extends FieldValues,
  TInput extends FieldValues,
>(
  schema: z.ZodType<TOutput, TInput>,
  props?: UseZodFormProps<TInput, TOutput>,
) {
  return useForm<TInput, unknown, TOutput>({
    mode: 'onTouched',
    ...props,
    resolver: zodResolver(schema),
  })
}
