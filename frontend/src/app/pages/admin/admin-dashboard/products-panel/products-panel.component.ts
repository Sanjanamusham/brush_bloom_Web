import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../../../../core/services/admin.service';
import { Product } from '../../../../core/models/product.model';
import { CATEGORIES, formatPrice } from '../../../../shared/config/site.config';
import { environment } from '../../../../../environments/environment';

const MAX_FILES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, mirrors the backend's multer limit
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // strip anything that isn't a letter, number, space or dash
    .replace(/\s+/g, '-') // spaces -> dashes
    .replace(/-+/g, '-') // collapse repeated dashes
    .replace(/^-|-$/g, ''); // trim leading/trailing dash
}

@Component({
  selector: 'app-products-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './products-panel.component.html',
  styleUrl: './products-panel.component.scss',
})
export class ProductsPanelComponent {
  private admin = inject(AdminService);
  private fb = inject(FormBuilder);

  products = signal<Product[]>([]);
  loading = signal(true);
  editingId = signal<string | null>(null);
  showForm = signal(false);
  categories = CATEGORIES;
  formatPrice = formatPrice;
  error = signal<string | null>(null);

  // Backend origin (strip the trailing /api) so relative /uploads/xyz.jpg paths render as previews.
  apiOrigin = environment.apiUrl.replace(/\/api\/?$/, '');

  // Already-saved image URLs (existing product) plus newly uploaded ones this session.
  images = signal<string[]>([]);
  uploading = signal(false);
  uploadError = signal<string | null>(null);

  // True once the person types directly into the Slug field — after that we stop
  // auto-overwriting it from the Name field, so a deliberate custom slug is respected.
  private slugManuallyEdited = false;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(140)]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    description: ['', [Validators.maxLength(2000)]],
    price: [0, [Validators.required, Validators.min(0)]],
    dimensions: ['', [Validators.maxLength(120)]],
    category: ['Wall Décor', [Validators.required]],
    inStock: [true],
    featured: [false],
    sortOrder: [0],
  });

  constructor() {
    this.load();

    this.form.controls.name.valueChanges.subscribe((name) => {
      if (!this.slugManuallyEdited) {
        this.form.controls.slug.setValue(slugify(name), { emitEvent: false });
      }
    });

    this.form.controls.slug.valueChanges.subscribe((slug) => {
      // Once the value diverges from what auto-generation would produce, treat it as manual.
      if (slug !== slugify(this.form.controls.name.value)) {
        this.slugManuallyEdited = true;
      }
    });
  }

  load(): void {
    this.loading.set(true);
    this.admin.listProducts().subscribe({
      next: (data) => {
        this.products.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  startCreate(): void {
    this.editingId.set(null);
    this.images.set([]);
    this.uploadError.set(null);
    this.slugManuallyEdited = false;
    this.form.reset({
      name: '',
      slug: '',
      description: '',
      price: 0,
      dimensions: '',
      category: 'Wall Décor',
      inStock: true,
      featured: false,
      sortOrder: 0,
    });
    this.showForm.set(true);
  }

  startEdit(p: Product): void {
    this.editingId.set(p.id);
    this.images.set([...(p.images || [])]);
    this.uploadError.set(null);
    this.slugManuallyEdited = true;
    this.form.reset({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      dimensions: p.dimensions,
      category: p.category,
      inStock: p.inStock,
      featured: p.featured,
      sortOrder: p.sortOrder,
    });
    this.showForm.set(true);
  }

  cancel(): void {
    this.showForm.set(false);
    this.error.set(null);
  }

  resolveImageUrl(url: string): string {
    // Already-absolute URLs (e.g. pasted from elsewhere) pass through untouched;
    // server-relative /uploads/... paths get the backend origin prefixed for display.
    return /^https?:\/\//i.test(url) ? url : `${this.apiOrigin}${url}`;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = ''; // allow re-selecting the same file later
    if (files.length === 0) return;

    this.uploadError.set(null);

    const remainingSlots = MAX_FILES - this.images().length;
    if (remainingSlots <= 0) {
      this.uploadError.set(`You can only have up to ${MAX_FILES} images per product.`);
      return;
    }

    const accepted: File[] = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        this.uploadError.set(`"${file.name}" isn't a supported image type (JPG, PNG, WEBP, GIF).`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        this.uploadError.set(`"${file.name}" is larger than 5MB.`);
        continue;
      }
      accepted.push(file);
      if (accepted.length >= remainingSlots) break;
    }

    if (accepted.length === 0) return;

    this.uploading.set(true);
    this.admin.uploadImages(accepted).subscribe({
      next: (urls) => {
        this.images.set([...this.images(), ...urls]);
        this.uploading.set(false);
      },
      error: (err) => {
        this.uploadError.set(err?.error?.message || 'Upload failed. Please try again.');
        this.uploading.set(false);
      },
    });
  }

  removeImage(index: number): void {
    this.images.set(this.images().filter((_, i) => i !== index));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set(null);
    const raw = this.form.getRawValue();
    const payload = {
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      price: Number(raw.price),
      dimensions: raw.dimensions,
      category: raw.category,
      images: this.images(),
      inStock: raw.inStock,
      featured: raw.featured,
      sortOrder: Number(raw.sortOrder),
    };

    const id = this.editingId();
    const request = id ? this.admin.updateProduct(id, payload) : this.admin.createProduct(payload);

    request.subscribe({
      next: () => {
        this.showForm.set(false);
        this.load();
      },
      error: (err) => this.error.set(err?.error?.message || 'Could not save product.'),
    });
  }

  remove(p: Product): void {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    this.admin.deleteProduct(p.id).subscribe(() => this.load());
  }
}
