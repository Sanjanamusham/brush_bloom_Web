import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';
import { formatPrice } from '../../config/site.config';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="card product-card">
      <a [routerLink]="['/art', product.slug]" class="thumb">
        @if (product.images.length) {
          <img [src]="product.images[0]" [alt]="product.name" loading="lazy" />
        } @else {
          <div class="thumb-placeholder">No image</div>
        }
        @if (!product.inStock) {
          <span class="badge out-of-stock">Out of stock</span>
        }
      </a>
      <div class="body">
        <span class="badge">{{ product.category }}</span>
        <h3><a [routerLink]="['/art', product.slug]">{{ product.name }}</a></h3>
        <p class="desc">{{ product.description }}</p>
        <div class="row">
          <span class="price">{{ formatPrice(product.price) }}</span>
          <button class="btn" (click)="add.emit(product)" [disabled]="!product.inStock">Add to Cart</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card { display: flex; flex-direction: column; overflow: hidden; }
    .thumb { position: relative; display: block; aspect-ratio: 1 / 1; background: var(--color-bg-warm); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .thumb-placeholder { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--color-muted); }
    .out-of-stock { position: absolute; top: 10px; left: 10px; background: #fff; }
    .body { padding: 16px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
    h3 { font-size: 1.05rem; }
    .desc { color: var(--color-muted); font-size: 0.85rem; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0; }
    .row { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
  `],
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() add = new EventEmitter<Product>();
  formatPrice = formatPrice;
}
