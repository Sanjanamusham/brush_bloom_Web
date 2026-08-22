import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import { formatPrice, resolveImageUrl } from '../../shared/config/site.config';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cart = inject(CartService);

  product = signal<Product | null>(null);
  loading = signal(true);
  notFound = signal(false);
  activeImage = signal(0);
  quantity = signal(1);
  added = signal(false);

  formatPrice = formatPrice;
  resolveImageUrl = resolveImageUrl;

  constructor() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }
    this.productService.getBySlug(slug).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loading.set(false);
      },
    });
  }

  selectImage(i: number): void {
    this.activeImage.set(i);
  }

  changeQuantity(delta: number): void {
    this.quantity.set(Math.min(50, Math.max(1, this.quantity() + delta)));
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cart.add(p, this.quantity());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }
}
