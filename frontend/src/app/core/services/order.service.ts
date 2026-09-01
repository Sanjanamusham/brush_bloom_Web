import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from './api-response.model';
import { OrderCreatedResult, OrderRequest, TrackOrderResult } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/orders`;

  create(payload: OrderRequest): Observable<OrderCreatedResult> {
    return this.http
      .post<ApiResponse<OrderCreatedResult>>(this.base, payload)
      .pipe(map((r) => r.data));
  }

  track(orderCode: string, phone: string): Observable<TrackOrderResult> {
    return this.http
      .post<ApiResponse<TrackOrderResult>>(`${this.base}/track`, { orderCode, phone })
      .pipe(map((r) => r.data));
  }
  uploadReferenceImages(files: File[]): Observable<{ urls: string[] }> {
  const formData = new FormData();
  files.forEach((f) => formData.append('images', f));
  return this.http
    .post<ApiResponse<{ urls: string[] }>>(`${this.base}/reference-upload`, formData)
    .pipe(map((r) => r.data));
}
}
