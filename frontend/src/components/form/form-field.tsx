import { useId, useRef, type ComponentProps, type ReactNode } from 'react'
import {
  Controller,
  type Control,
  type FieldPath,
  type RefCallBack,
  type FieldValues,
} from 'react-hook-form'
import { cn } from 'cn'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type FormFieldOption = {
  value: string
  label: string
  disabled?: boolean
}

type BaseFormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TTransformedValues,
> = {
  control: Control<TFieldValues, unknown, TTransformedValues>
  name: TName
  label?: ReactNode
  description?: ReactNode
  className?: string
  labelClassName?: string
  fieldClassName?: string
  descriptionClassName?: string
  errorClassName?: string
}

type InputFieldProps = {
  as?: 'input'
  endAdornment?: ReactNode
} & Omit<
  ComponentProps<typeof Input>,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'className'
>

type SelectFieldProps = {
  as: 'select'
  options: readonly FormFieldOption[]
  /** Texto exibido enquanto nada foi escolhido. */
  placeholder?: ReactNode
  /** Classes do painel flutuante e de cada opção do select. */
  contentClassName?: string
  itemClassName?: string
  id?: string
  disabled?: boolean
  required?: boolean
  autoComplete?: string
}

export type FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
> = BaseFormFieldProps<TFieldValues, TName, TTransformedValues> &
  (InputFieldProps | SelectFieldProps)

/**
 * Campo de formulário controlado pelo react-hook-form.
 *
 * `name` é tipado a partir do schema usado em `useZodForm`, e a mensagem de
 * erro exibida é a definida no próprio schema do Zod.
 */
export function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TTransformedValues = TFieldValues,
>(props: FormFieldProps<TFieldValues, TName, TTransformedValues>) {
  const generatedId = useId()
  const {
    control,
    name,
    label,
    description,
    className,
    labelClassName,
    fieldClassName,
    descriptionClassName,
    errorClassName,
    ...fieldProps
  } = props

  const id = fieldProps.id ?? generatedId
  const descriptionId = `${id}-description`
  const errorId = `${id}-error`

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const errorMessage = fieldState.error?.message
        const describedBy =
          [description ? descriptionId : null, errorMessage ? errorId : null]
            .filter(Boolean)
            .join(' ') || undefined

        const controlProps: ControlProps = {
          id,
          name: field.name,
          value: field.value,
          onChange: field.onChange,
          onBlur: field.onBlur,
          controlRef: field.ref,
          fieldDisabled: field.disabled,
          invalid: fieldState.invalid,
          describedBy,
          className: fieldClassName,
        }

        return (
          <div
            data-slot="form-field"
            data-invalid={fieldState.invalid || undefined}
            className={cn('grid gap-2', className)}
          >
            {label ? (
              <Label htmlFor={id} className={labelClassName}>
                {label}
              </Label>
            ) : null}

            {fieldProps.as === 'select' ? (
              <SelectControl {...fieldProps} {...controlProps} />
            ) : (
              <InputControl {...fieldProps} {...controlProps} />
            )}

            {description ? (
              <p
                id={descriptionId}
                className={cn(
                  'text-xs text-muted-foreground',
                  descriptionClassName,
                )}
              >
                {description}
              </p>
            ) : null}

            {errorMessage ? (
              <p
                id={errorId}
                role="alert"
                className={cn('text-xs text-destructive', errorClassName)}
              >
                {errorMessage}
              </p>
            ) : null}
          </div>
        )
      }}
    />
  )
}

type ControlProps = {
  id: string
  name: string
  value: unknown
  onChange: (value: unknown) => void
  onBlur: () => void
  controlRef: RefCallBack
  fieldDisabled: boolean | undefined
  invalid: boolean
  describedBy: string | undefined
  className: string | undefined
}

function InputControl({
  id,
  name,
  value,
  onChange,
  onBlur,
  controlRef,
  fieldDisabled,
  invalid,
  describedBy,
  className,
  as: _as,
  endAdornment,
  disabled,
  ...props
}: InputFieldProps & ControlProps) {
  if (props.type === 'checkbox') {
    return (
      <Input
        {...props}
        id={id}
        ref={controlRef}
        name={name}
        checked={Boolean(value)}
        onChange={(event) => onChange(event.target.checked)}
        onBlur={onBlur}
        disabled={fieldDisabled || disabled}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        className={className}
      />
    )
  }

  const input = (
    <Input
      {...props}
      id={id}
      ref={controlRef}
      name={name}
      value={(value as string | number | undefined) ?? ''}
      onChange={onChange}
      onBlur={onBlur}
      disabled={fieldDisabled || disabled}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={className}
    />
  )

  if (!endAdornment) return input

  return (
    <div className="relative">
      {input}
      {endAdornment}
    </div>
  )
}

function SelectControl({
  id,
  name,
  value,
  onChange,
  onBlur,
  controlRef,
  fieldDisabled,
  invalid,
  describedBy,
  className,
  options,
  placeholder,
  contentClassName,
  itemClassName,
  disabled,
  required,
  autoComplete,
}: SelectFieldProps & ControlProps) {
  const portalContainerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={portalContainerRef} className="contents">
      <Select
        items={options}
        name={name}
        value={(value as string | undefined) || null}
        onValueChange={(nextValue) => onChange(nextValue ?? '')}
        onOpenChange={(open) => {
          if (!open) onBlur()
        }}
        disabled={fieldDisabled || disabled}
        required={required}
        autoComplete={autoComplete}
      >
        <SelectTrigger
          id={id}
          ref={controlRef}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn('w-full', className)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          align="start"
          alignItemWithTrigger={false}
          sideOffset={6}
          portalContainer={portalContainerRef}
          className={contentClassName}
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={itemClassName}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
