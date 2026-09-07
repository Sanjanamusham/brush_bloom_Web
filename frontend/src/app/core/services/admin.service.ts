import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './api-response.model';
import { Product } from '../models/product.model';
import { AdminOrder } from '../models/order.model';

export interface ProductInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  dimensions: string;
  category: string;
  images: string[];
  inStock: boolean;
  featured: boolean;
  sortOrder: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin`;

  // Products
  listProducts(): Observable<Product[]> {
    return this.http
      .get<ApiResponse<Product[]>>(`${this.base}/products`)
      .pipe(map((r) => r.data));
  }

  createProduct(payload: ProductInput): Observable<Product> {
    return this.http
      .post<ApiResponse<Product>>(`${this.base}/products`, payload)
      .pipe(map((r) => r.data));
  }

  updateProduct(id: string, payload: Partial<ProductInput>): Observable<Product> {
    return this.http
      .patch<ApiResponse<Product>>(`${this.base}/products/${id}`, payload)
      .pipe(map((r) => r.data));
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/products/${id}`).pipe(map(() => void 0));
  }

  // Uploads one or more image files, returns the server-relative URLs to store on the product.
  uploadImages(files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return this.http
      .post<ApiResponse<{ urls: string[] }>>(`${this.base}/uploads`, formData)
      .pipe(map((r) => r.data.urls));
  }

  // Orders
  listOrders(filters: { status?: string; search?: string } = {}): Observable<AdminOrder[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params = params.set(k, v);
    });
    return this.http
      .get<ApiResponse<AdminOrder[]>>(`${this.base}/orders`, { params })
      .pipe(map((r) => r.data));
  }

 updateOrderStatus(id: string, status: string, deliveryNote?: string): Observable<{ order: AdminOrder; whatsappConfirmUrl: string | null }> {
  return this.http
    .patch<{ success: boolean; data: AdminOrder; whatsappConfirmUrl: string | null }>(
      `${this.base}/orders/${id}/status`,
      { status, deliveryNote },
    )
    .pipe(map((r) => ({ order: r.data, whatsappConfirmUrl: r.whatsappConfirmUrl })));
}
}
