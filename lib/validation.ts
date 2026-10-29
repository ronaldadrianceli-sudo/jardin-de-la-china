// lib/validation.ts
import { z } from 'zod'
import { htmlToText } from '@/lib/richtext'
import { ALLOWED_MIME, CATEGORIES, MAX_IMAGES, MAX_IMAGE_BYTES } from '@/lib/constants'

const plantBase = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(120, 'Máximo 120 caracteres'),
  // Contiene HTML del editor enriquecido; la longitud se valida sobre el texto visible.
  description: z
    .string()
    .max(20000, 'La descripción es demasiado larga')
    .refine((v) => htmlToText(v).length > 0, 'La descripción es obligatoria')
    .refine((v) => htmlToText(v).length <= 2000, 'Máximo 2000 caracteres de texto'),
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Selecciona una categoría' }) }),
  price: z
    .number({ required_error: 'El precio es obligatorio', invalid_type_error: 'Ingresa un precio válido' })
    .positive('El precio debe ser mayor a 0')
    .max(99999999.99, 'Precio demasiado alto'),
  precio_oferta: z
    .number({ invalid_type_error: 'Ingresa un precio de oferta válido' })
    .positive('El precio de oferta debe ser mayor a 0')
    .max(99999999.99, 'Precio demasiado alto')
    .nullable(),
  available: z.boolean(),
})

function offerIsLower(d: { price: number; precio_oferta: number | null }): boolean {
  return d.precio_oferta === null || d.precio_oferta < d.price
}
const offerIssue = { message: 'El precio de oferta debe ser menor al precio normal', path: ['precio_oferta'] }

/** Campos del formulario (sin imágenes). */
export const plantSchema = plantBase.refine(offerIsLower, offerIssue)
export type PlantInput = z.infer<typeof plantSchema>

/** Lo que recibe el Server Action: campos + URLs finales (en orden; la primera es la portada). */
export const plantPayloadSchema = plantBase
  .extend({
    image_urls: z
      .array(z.string().url().max(2048))
      .min(1, 'Agrega al menos una foto.')
      .max(MAX_IMAGES, `Máximo ${MAX_IMAGES} fotos.`),
  })
  .refine(offerIsLower, offerIssue)
export type PlantPayload = z.infer<typeof plantPayloadSchema>

export const loginSchema = z.object({
  email: z.string().trim().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})
export type LoginInput = z.infer<typeof loginSchema>

/** Devuelve un mensaje de error o null si la imagen es válida. */
export function validateImage(file: { type: string; size: number }): string | null {
  if (!(ALLOWED_MIME as readonly string[]).includes(file.type)) {
    return 'Formato no permitido. Usa JPG, PNG o WebP.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'La imagen supera los 5 MB.'
  }
  return null
}
