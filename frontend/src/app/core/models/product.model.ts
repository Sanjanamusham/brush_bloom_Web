export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  dimensions: string;
  category: string;
  images: string[];
  inStock: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}
