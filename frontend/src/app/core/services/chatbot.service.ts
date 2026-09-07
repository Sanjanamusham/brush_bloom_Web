import { Injectable } from '@angular/core';
import { CHATBOT_FAQ, FaqEntry } from '../../shared/config/chatbot-faq.config';

const GREETING_WORDS = [
  'hi', 'hii', 'hiii', 'hello', 'hey', 'heya', 'hola',
  'good morning', 'good afternoon', 'good evening',
];

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  isGreeting(userInput: string): boolean {
    const normalized = userInput.toLowerCase().trim();
    return GREETING_WORDS.some(
      (g) => normalized === g || normalized.startsWith(g + ' ') || normalized.startsWith(g + '!'),
    );
  }

  findAnswer(userInput: string): FaqEntry | null {
    const normalized = userInput.toLowerCase().trim();
    if (!normalized) return null;

    let best: { entry: FaqEntry; score: number } | null = null;

    for (const entry of CHATBOT_FAQ) {
      let score = 0;
      for (const keyword of entry.keywords) {
        if (normalized.includes(keyword)) {
          score += keyword.split(' ').length;
        }
      }
      if (score > 0 && (!best || score > best.score)) {
        best = { entry, score };
      }
    }

    return best ? best.entry : null;
  }

  getById(id: string): FaqEntry | undefined {
    return CHATBOT_FAQ.find((f) => f.id === id);
  }
}