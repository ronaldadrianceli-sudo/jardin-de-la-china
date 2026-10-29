// components/LoginForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { login } from '@/lib/actions/auth'
import { loginSchema, type LoginInput } from '@/lib/validation'
import Spinner from '@/components/Spinner'

export default function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginInput) {
    setServerError(null)
    const res = await login(values.email, values.password) // redirige a /admin si es exitoso
    if (res && !res.ok) setServerError(res.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">Correo</label>
        <input id="email" type="email" autoComplete="email" className="input" aria-invalid={!!errors.email} {...register('email')} />
        {errors.email && <p role="alert" className="mt-1 text-sm text-red-700">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">Contraseña</label>
        <input id="password" type="password" autoComplete="current-password" className="input" aria-invalid={!!errors.password} {...register('password')} />
        {errors.password && <p role="alert" className="mt-1 text-sm text-red-700">{errors.password.message}</p>}
      </div>
      {serverError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{serverError}</p>}
      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting && <Spinner />} Ingresar
      </button>
    </form>
  )
}
