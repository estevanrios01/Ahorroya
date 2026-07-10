import { z } from 'zod';

export const searchSchema = z.object({
  q: z.string().max(200).optional().default(''),
  category: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: z.enum(['relevancia', 'precio_menor', 'distancia_menor']).optional().default('relevancia'),
});

export const productSlugSchema = z.object({
  slug: z.string().min(1).max(300),
});

export const productIdSchema = z.object({
  id: z.string().uuid(),
});

export const storeSlugSchema = z.object({
  slug: z.string().min(1).max(200),
});

export const categorySlugSchema = z.object({
  slug: z.string().min(1).max(100),
});

export const brandSlugSchema = z.object({
  slug: z.string().min(1).max(150),
});

export const citySlugSchema = z.object({
  slug: z.string().min(1).max(100),
});

export const departmentSlugSchema = z.object({
  slug: z.string().min(1).max(100),
});

export const barcodeSchema = z.object({
  code: z.string().regex(/^\d{8,13}$/),
});

export const barcodeScanSchema = z.object({
  code: z.string().regex(/^\d{8,13}$/),
  format: z.string().max(20).optional().default('EAN-13'),
});

export const favoriteToggleSchema = z.object({
  productId: z.string().uuid(),
});

export const scrapeQuerySchema = z.object({
  q: z.string().min(1).max(200),
});

export const aiRecommendSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().max(300).optional(),
  currentPrice: z.number().positive().optional(),
});

export const aiSuggestSchema = z.object({
  q: z.string().max(200).optional().default(''),
});

export const analyticsEventSchema = z.object({
  name: z.string().min(1).max(100),
  properties: z.record(z.any()).optional().default({}),
});

export const contactSchema = z.object({
  name: z.string().min(1).max(150),
  email: z.string().email().max(255),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

export const reportSchema = z.object({
  productId: z.string().uuid(),
  reason: z.string().min(1).max(500),
  email: z.string().email().max(255).optional(),
});

export const imageUploadSchema = z.object({
  file: z.any().refine(f => f && f.size > 0, 'Archivo requerido'),
});

export const sanitize = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>"'&]/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '&': '&amp;',
  })[c] || c);
};
