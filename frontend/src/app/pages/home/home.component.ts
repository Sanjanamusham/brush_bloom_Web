import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { CATEGORIES ,siteConfig  } from '../../shared/config/site.config';
import { formatPrice, resolveImageUrl } from '../../shared/config/site.config';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private productService = inject(ProductService);

  categories = CATEGORIES;
  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  siteConfig = siteConfig;

  selectedCategory = signal<string>('');
  sort = signal<'' | 'price-asc' | 'price-desc' | 'newest'>('');

  formatPrice = formatPrice;
  resolveImageUrl = resolveImageUrl;

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.productService
      .list({
        category: this.selectedCategory() || undefined,
        sort: (this.sort() as 'price-asc' | 'price-desc' | 'newest') || undefined,
      })
      .subscribe({
        next: (data) => {
          this.products.set(data);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Could not load products. Is the backend running?');
          this.loading.set(false);
        },
      });
  }

  onFilterChange(): void {
    this.load();
  }
}
