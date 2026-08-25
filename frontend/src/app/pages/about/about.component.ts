import { Component , signal} from '@angular/core';
import { siteConfig, whatsappLink } from '../../shared/config/site.config';

interface FaqItem {
  question: string;
  answer: string;
}
@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  siteConfig = siteConfig;
  whatsapp = whatsappLink(`Hi ${siteConfig.name}, I'd love to know more about your work.`);
  whatsappOrder = whatsappLink(`Hi ${siteConfig.name}, I'd like to place an order.`);

  openIndex = signal<number | null>(0);

  faqs: FaqItem[] = [
    {
      question: 'How do I place an order?',
      answer:
        "Browse the collection, add the pieces you love to your cart, then submit your name, phone and address on the cart page. You'll get an Order ID and we'll receive your request instantly on WhatsApp — no payment is taken online. You can also message us directly any time using the WhatsApp button on any page.",
    },
    {
      question: 'What information should I send?',
      answer:
        'To confirm your order quickly, please share: your Order ID (if you submitted one through the site), the name of the piece(s) you want, your full delivery address with pincode, and a preferred time to be contacted. For a custom commission, also tell us the approximate size and any colours or motifs you have in mind.',
    },
    {
      question: 'How quickly will you reply?',
      answer:
        'We usually reply within a few hours during the day. Orders placed outside working hours are answered the next morning. Once we confirm the final price and delivery cost, you can track progress anytime on the Track Order page using your Order ID and phone number.',
    },
    {
      question: 'Do I pay through the website?',
      answer:
        'No. Payment is arranged directly with us on WhatsApp after we confirm your order. The website only sends an order request — it never collects card details or takes payment.',
    },
    {
      question: 'Can I order something custom?',
      answer:
        "Yes. Every piece is made by hand, so we welcome custom sizes, colours and motifs. Message us on WhatsApp with your idea and we'll work out the details and pricing with you before we begin.",
    },
  ];

  toggle(index: number): void {
    this.openIndex.set(this.openIndex() === index ? null : index);
  }
}

