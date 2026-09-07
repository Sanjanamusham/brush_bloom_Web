import { Component, inject } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-stack">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast" [class]="t.type" (click)="toast.dismiss(t.id)">
          {{ t.message }}
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed; bottom: 20px; right: 20px; z-index: 1000;
      display: flex; flex-direction: column; gap: 10px; max-width: 320px;
    }
    .toast {
      padding: 12px 16px; border-radius: var(--radius); color: #fff; font-size: 0.9rem;
      cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    .toast.success { background: var(--color-primary); }
    .toast.error { background: #b3261e; }
    .toast.info { background: var(--color-text); }
  `],
})
export class ToastComponent {
  toast = inject(ToastService);
}