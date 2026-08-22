import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Brush Bloom - Handmade Lippan Art',
  },
  {
    path: 'art/:slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail.component').then(
        (m) => m.ProductDetailComponent,
      ),
    title: 'Product - Brush Bloom',
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then((m) => m.CartComponent),
    title: 'Your Cart - Brush Bloom',
  },
  {
    path: 'track',
    loadComponent: () =>
      import('./pages/track-order/track-order.component').then((m) => m.TrackOrderComponent),
    title: 'Track Order - Brush Bloom',
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about.component').then((m) => m.AboutComponent),
    title: 'About - Brush Bloom',
  },
  {
    // Deliberately not linked in the public nav — matches the original "not linked anywhere" requirement.
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin-login/admin-login.component').then(
        (m) => m.AdminLoginComponent,
      ),
    title: 'Admin Login',
  },
  {
    path: 'admin/forgot-password',
    loadComponent: () =>
      import('./pages/admin/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
    title: 'Forgot Password - Admin',
  },
  {
    path: 'admin/reset-password',
    loadComponent: () =>
      import('./pages/admin/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
    title: 'Reset Password - Admin',
  },
  {
    path: 'admin/dashboard',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent,
      ),
    title: 'Admin Dashboard',
  },
  { path: '**', redirectTo: '' },
];
