import { z } from 'zod';

/**
 * Schema de validación para SlideLayout usando Zod
 */
export const slideLayoutSchema = z.enum(['text-image', 'text-only', 'title-only']);

/**
 * Schema de validación para ThemeName usando Zod
 * Debe coincidir con los temas definidos en types.ts y constants/themes.ts
 */
export const themeNameSchema = z.enum([
  'purple-pink',
  'blue-cyan',
  'green-emerald',
  'orange-red',
  'dark-minimal',
]);

/**
 * Schema de validación para FontSize usando Zod (para títulos)
 */
export const titleSizeSchema = z.enum(['small', 'medium', 'large', 'xlarge']);

/**
 * Schema de validación para FontSize usando Zod (para contenido)
 * No permite 'xlarge' ya que el contenido no debe ser tan grande
 */
export const contentSizeSchema = z.enum(['small', 'medium', 'large']);

/**
 * Schema de validación para FontFamily usando Zod
 */
export const fontFamilySchema = z.enum([
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
]);

/**
 * Schema de validación para ContentPoint (nuevo formato con iconos opcionales)
 */
export const contentPointSchema = z.object({
  text: z.string().min(1, 'El texto no puede estar vacío'),
  icon: z.string().optional(),
});

/**
 * Schema completo de validación para Slide
 * Valida que el slide tenga la estructura correcta y tipos válidos
 * Soporta tanto el formato antiguo (array de strings) como el nuevo (array de ContentPoint)
 */
export const slideSchema = z.object({
  title: z.string().min(1, 'El título no puede estar vacío').max(200, 'El título es demasiado largo'),
  content: z.union([
    z.array(z.string().min(1, 'El contenido no puede estar vacío')).min(0).max(20, 'Demasiados puntos de contenido'),
    z.array(contentPointSchema).min(0).max(20, 'Demasiados puntos de contenido'),
  ]),
  layout: slideLayoutSchema,
  imageUrl: z.string().url().optional().or(z.literal('')),
  imagePrompt: z.string().optional(),
});

/**
 * Schema de validación para FontSettings
 * titleSize permite 'small', 'medium', 'large', 'xlarge'
 * contentSize solo permite 'small', 'medium', 'large' (sin 'xlarge')
 */
export const fontSettingsSchema = z.object({
  fontFamily: fontFamilySchema,
  titleSize: titleSizeSchema,
  contentSize: contentSizeSchema,
});

/**
 * Schema de validación para SavedPresentation
 */
export const savedPresentationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  slides: z.array(slideSchema),
  createdAt: z.number().positive(),
  updatedAt: z.number().positive(),
});

/**
 * Type-safe branded type para Slide IDs
 */
export type SlideId = string & { readonly __brand: unique symbol };

/**
 * Type-safe branded type para Presentation IDs
 */
export type PresentationId = string & { readonly __brand: unique symbol };

/**
 * Funciones helper para crear branded types
 */
export function createSlideId(id: string): SlideId {
  return id as SlideId;
}

export function createPresentationId(id: string): PresentationId {
  return id as PresentationId;
}

/**
 * Inferir tipos TypeScript desde schemas Zod
 */
export type SlideSchema = z.infer<typeof slideSchema>;
export type SlideLayoutSchema = z.infer<typeof slideLayoutSchema>;
export type ThemeNameSchema = z.infer<typeof themeNameSchema>;
export type FontSettingsSchema = z.infer<typeof fontSettingsSchema>;
export type SavedPresentationSchema = z.infer<typeof savedPresentationSchema>;

