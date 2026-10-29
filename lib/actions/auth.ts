// lib/actions/auth.ts
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validation'
import type { ActionResult } from '@/lib/types'

export async function login(email: string, password: string): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email, password })
  if (!parsed.success) return { ok: false, error: 'Revisa tu correo y contraseña.' }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error) return { ok: false, error: 'Correo o contraseña incorrectos.' }

  redirect('/admin')
}

export async function logout(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
