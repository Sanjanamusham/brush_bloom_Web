import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../../core/services/chatbot.service';
import { SUGGESTED_QUESTIONS } from '../../config/chatbot-faq.config';
import { siteConfig, whatsappLink } from '../../config/site.config';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
}

const BOT_NAME = 'Bloomi';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss',
})
export class ChatbotComponent {
  private chatbot = inject(ChatbotService);

  botName = BOT_NAME;
  open = signal(false);
  input = signal('');
  textEnabled = signal(false);

  messages = signal<ChatMessage[]>([
    {
      from: 'bot',
      text: `Hi! I'm ${BOT_NAME}, the ${siteConfig.name} assistant. Tap a question below, or choose "Something else" to type your own.`,
    },
  ]);

  suggested = [...SUGGESTED_QUESTIONS, { id: 'other', question: 'Something else' }];
  siteConfig = siteConfig;
  emailHref = `mailto:${siteConfig.email}`;
  whatsappHref = whatsappLink(`Hi ${siteConfig.name}, I have a question your chatbot couldn't answer.`);

  toggle(): void {
    this.open.update((v) => !v);
  }

  askSuggested(id: string): void {
    if (id === 'other') {
      this.textEnabled.set(true);
      this.messages.update((list) => [
        ...list,
        { from: 'bot', text: "Sure — type your question below and I'll do my best to help." },
      ]);
      return;
    }
    const entry = this.chatbot.getById(id);
    if (!entry) return;
    this.pushExchange(entry.question, entry.answer);
  }

  send(): void {
    if (!this.textEnabled()) return;
    const text = this.input().trim();
    if (!text) return;
    this.input.set('');

    if (this.chatbot.isGreeting(text)) {
      this.pushExchange(
        text,
        `Hi there! Pick a topic below, or ask me anything about ordering, tracking, cancellations, or custom pieces.`,
      );
      return;
    }

    const match = this.chatbot.findAnswer(text);
    const answer =
      match?.answer ??
      `I couldn't find an answer to that. Email us at ${siteConfig.email} or message us on WhatsApp, and we'll help directly.`;

    this.pushExchange(text, answer);
  }

  private pushExchange(userText: string, botText: string): void {
    this.messages.update((list) => [...list, { from: 'user', text: userText }, { from: 'bot', text: botText }]);
  }
}