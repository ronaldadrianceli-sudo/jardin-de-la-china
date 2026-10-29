// lib/auth.ts
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/** Para páginas /admin/*: valida con getUser() (consulta a Supabase) o redirige. */
export async function requireUser() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) redirect('/login')
  return { supabase, user: data.user }
}

/** Para Server Actions: valida con getUser() y devuelve null si no hay sesión. */
export async function getAuthed() {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  return { supabase, user: data.user }
}
