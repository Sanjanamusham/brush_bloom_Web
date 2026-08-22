import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../models/product.model';
import { ApiResponse } from './api-response.model';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price-asc' | 'price-desc' | 'newest';
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/products`;

  list(filters: ProductFilters = {}): Observable<Product[]> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params = params.set(k, String(v));
    });
    return this.http
      .get<ApiResponse<Product[]>>(this.base, { params })
      .pipe(map((res) => res.data));
  }

  getBySlug(slug: string): Observable<Product> {
    return this.http.get<ApiResponse<Product>>(`${this.base}/${slug}`).pipe(map((r) => r.data));
  }
}
