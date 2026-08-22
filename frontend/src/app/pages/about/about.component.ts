import { Component } from '@angular/core';
import { siteConfig, whatsappLink } from '../../shared/config/site.config';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  siteConfig = siteConfig;
  whatsapp = whatsappLink(`Hi ${siteConfig.name}, I'd love to know more about your work.`);
}
