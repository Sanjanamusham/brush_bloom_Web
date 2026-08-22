import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { siteConfig } from '../../config/site.config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <div class="container bar">
        <a routerLink="/" class="brand">{{ siteConfig.name }}</a>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Shop</a>
          <a routerLink="/about" routerLinkActive="active">About</a>
          <a routerLink="/track" routerLinkActive="active">Track Order</a>
          <a routerLink="/cart" routerLinkActive="active" class="cart-link">
            Cart
            @if (cart.count() > 0) {
              <span class="cart-count">{{ cart.count() }}</span>
            }
          </a>
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .site-header { border-bottom: 1px solid var(--color-border); position: sticky; top: 0; background: #fff; z-index: 10; }
    .bar { display: flex; align-items: center; justify-content: space-between; height: 68px; }
    .brand { font-family: var(--font-heading); font-size: 1.3rem; font-weight: 700; color: var(--color-primary); }
    nav { display: flex; align-items: center; gap: 24px; font-weight: 500; }
    nav a { color: var(--color-text); padding: 6px 0; border-bottom: 2px solid transparent; }
    nav a.active { color: var(--color-primary); border-color: var(--color-primary); }
    .cart-link { position: relative; }
    .cart-count {
      background: var(--color-accent); color: #2a2205; font-size: 0.7rem; font-weight: 700;
      border-radius: 999px; padding: 1px 6px; margin-left: 4px;
    }
  `],
})
export class HeaderComponent {
  cart = inject(CartService);
  siteConfig = siteConfig;
}
