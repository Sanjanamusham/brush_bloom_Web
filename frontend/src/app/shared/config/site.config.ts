/**
 * Single place to edit business details — mirrors src/config/site.ts from the
 * original app. Change the WhatsApp number here and it updates everywhere.
 */
import { environment } from '../../../environments/environment';

export const siteConfig = {
  name: 'Brush Bloom Handmade',
  title: 'Brush Bloom - Handmade Lippan Art',
  handle: '@Brush_Bloom_Handmade',
  tagline: 'Handcrafted Lippan art from the heart of Kutch',
  description:
    'Shop handcrafted Lippan art and mirror-work wall décor. Discover unique traditional Indian designs made to bring warmth, beauty, and character to your space.',

  /** Full international number, digits only, no + or spaces. Edit this one line. */
  whatsappNumber: '919505905090',

  email: 'sanjanamusham0103@gmail.com',
  instagram: 'https://instagram.com/Brush_Bloom_Handmade',
  instagramHandle: '@Brush_Bloom_Handmade',
  currencySymbol: '₹',
  currency: 'INR',
} as const;

export const CATEGORIES = ['Wall Décor', 'Mirror Frames', 'Wall Clocks', 'Custom Orders'] as const;
export type Category = (typeof CATEGORIES)[number];

export const ORDER_STATUSES = [
  'Pending Confirmation',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export function whatsappLink(message: string): string {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(value: number): string {
  return `${siteConfig.currencySymbol}${Number(value).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Product images uploaded via the admin panel are stored as server-relative
 * paths (e.g. "/uploads/xyz.jpg"). The backend and the Angular dev server run
 * on different ports/origins, so those paths need the backend origin prefixed
 * before they'll load anywhere outside the admin form. Already-absolute URLs
 * (http/https) pass through untouched.
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const apiOrigin = environment.apiUrl.replace(/\/api\/?$/, '');
  return `${apiOrigin}${url}`;
}
