export interface FaqEntry {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
}

export const CHATBOT_FAQ: FaqEntry[] = [
  {
    id: 'what-is-lippan',
    question: 'What is Lippan art?',
    keywords: ['what is lippan', 'lippan art', 'what is this craft', 'about lippan'],
    answer:
      'Lippan is a traditional Gujarati mirror-work mud art from Kutch. Each piece is hand-sculpted in clay and finished with hand-cut glass mirrors — no two pieces are ever identical.',
  },
  {
    id: 'place-order',
    question: 'How do I place an order?',
    keywords: ['place an order', 'how to order', 'how do i order', 'buy', 'purchase'],
    answer:
      'Browse the Shop, add pieces to your cart, then submit your details on the Cart page. You\'ll get an Order ID and we\'ll receive your request instantly — no payment is taken online.',
  },
  {
    id: 'track-order',
    question: 'How can I track my order?',
    keywords: ['track', 'track my order', 'order status', 'where is my order'],
    answer:
      'Go to the "Track Order" page and enter your Order ID along with the phone number you used when ordering.',
  },
  {
    id: 'cancel-order',
    question: 'Can I cancel my order?',
    keywords: ['cancel', 'cancel my order', 'cancel order', 'stop my order'],
    answer:
      'Yes — you can cancel any order yourself from the Track Order page, but only while it\'s still "Pending Confirmation". Once we confirm it, cancellation has to be arranged directly with us on WhatsApp.',
  },
  {
    id: 'custom-order',
    question: 'Can I order something custom?',
    keywords: ['custom', 'custom order', 'custom design', 'personalised', 'personalized'],
    answer:
      'Yes! On the Cart page you can attach up to 3 reference images and a Pinterest/Instagram/YouTube link to show us what you have in mind, plus a note describing your idea.',
  },
  {
    id: 'payment',
    question: 'Do I pay through the website?',
    keywords: ['payment', 'pay', 'how to pay', 'card', 'upi'],
    answer:
      'No — this website never collects payment. We confirm the final price and delivery cost with you directly, and payment is arranged after that.',
  },
  {
    id: 'delivery-time',
    question: 'How long does delivery take?',
    keywords: ['delivery time', 'how long', 'shipping time', 'when will i get it'],
    answer:
      'Delivery timelines depend on the piece and your location — we\'ll confirm an exact estimate with you once your order is confirmed.',
  },
  {
    id: 'reply-time',
    question: 'How quickly will you reply?',
    keywords: ['reply', 'response time', 'how fast', 'when will you respond'],
    answer:
      'We usually reply within a few hours during the day. Orders placed outside working hours are answered the next morning.',
  },
];

export const SUGGESTED_QUESTIONS = CHATBOT_FAQ.slice(0, 5).map((f) => ({ id: f.id, question: f.question }));