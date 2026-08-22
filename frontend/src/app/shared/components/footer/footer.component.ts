import { Component } from '@angular/core';
import { siteConfig, whatsappLink } from '../../config/site.config';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="section-warm">
      <div class="container foot">
        <div>
          <h3>{{ siteConfig.name }}</h3>
          <p class="muted">{{ siteConfig.tagline }}</p>
        </div>
        <div class="links">
          <a class="link-row" [href]="whatsapp" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">
            <span class="icon-badge">
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.868-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.148.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12.002 2C6.478 2 2 6.477 2 12c0 1.926.55 3.72 1.5 5.246L2 22l4.918-1.464A9.94 9.94 0 0 0 12.002 22C17.526 22 22 17.523 22 12S17.526 2 12.002 2zm0 18.2a8.19 8.19 0 0 1-4.19-1.153l-.3-.179-3.108.925.933-3.032-.196-.31A8.19 8.19 0 1 1 20.19 12a8.198 8.198 0 0 1-8.188 8.2z"/>
              </svg>
            </span>
            <span>WhatsApp</span>
          </a>
          <a class="link-row" [href]="siteConfig.instagram" target="_blank" rel="noopener" aria-label="Follow on Instagram">
            <span class="icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" ry="5"/>
                <path d="M16 11.37a4 4 0 1 1-7.914 1.174A4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </span>
            <span>Instagram</span>
          </a>
          <a class="link-row" [href]="'mailto:' + siteConfig.email" aria-label="Email us">
            <span class="icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-10 6L2 7"/>
              </svg>
            </span>
            <span>{{ siteConfig.email }}</span>
          </a>
        </div>
      </div>
      <p class="muted small container">© {{ year }} {{ siteConfig.name }}. All rights reserved.</p>
    </footer>
  `,
  styles: [`
    footer { padding: 40px 0 20px; margin-top: 60px; }
    .foot { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 24px; padding-bottom: 20px; }
    .links { display: flex; flex-direction: column; gap: 12px; }
    .muted { color: var(--color-muted); }
    .small { font-size: 0.8rem; }

    .link-row {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: var(--color-text);
      font-weight: 500;
      width: fit-content;
    }

    .icon-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #fff;
      border: 1px solid var(--color-border);
      color: var(--color-primary);
      transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
    }
    .icon-badge svg { width: 17px; height: 17px; }

    .link-row:hover .icon-badge,
    .link-row:focus-visible .icon-badge {
      background: var(--color-primary);
      color: #fff;
      transform: translateY(-3px) scale(1.08);
      box-shadow: 0 6px 14px rgba(47, 93, 58, 0.25);
    }

    .link-row:active .icon-badge {
      transform: translateY(-1px) scale(0.95);
      transition-duration: 0.08s;
    }
  `],
})
export class FooterComponent {
  siteConfig = siteConfig;
  whatsapp = whatsappLink(`Hi ${siteConfig.name}, I have a question.`);
  year = new Date().getFullYear();
}
