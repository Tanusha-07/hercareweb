import { config } from './config';

/**
 * AI assistant endpoint logic.
 *
 * Honesty rule: when no AI provider is configured we do NOT pretend a model is
 * connected. We return `demo: true` and let the client fall back to its own
 * curated educational content. When a provider IS configured, requests are sent
 * with a strict, non-diagnostic, safety-first system prompt.
 */

const SYSTEM_PROMPT = `You are HerCare+, a supportive health information assistant for women in India,
including low-literacy and rural users. Rules:
- Give general, safe health information only. NEVER diagnose or prescribe.
- Be compassionate and non-judgmental. Use short, plain sentences.
- Reply in the same language the user writes in (English, हिन्दी, or ಕನ್ನಡ).
- If symptoms could be an emergency, tell the user to call 112 or go to the nearest hospital now.
- Always suggest confirming with a qualified health worker, and mention the app can find a nearby clinic.`;

export interface AssistantRequest {
  message: string;
  lang: 'en' | 'hi' | 'kn';
}

export interface AssistantResponse {
  answer: string;
  demo: boolean;
  visualId?: string;
}

export async function answerAssistant(req: AssistantRequest): Promise<AssistantResponse> {
  const configured = config.ai.provider === 'openai' && Boolean(config.ai.apiKey) && Boolean(config.ai.endpoint);
  if (!configured) {
    // No live model connected — signal demo mode so the client uses safe content.
    return { answer: '', demo: true };
  }

  try {
    const res = await fetch(config.ai.endpoint as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL ?? 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: req.message },
        ],
      }),
    });
    if (!res.ok) return { answer: '', demo: true };
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    if (!text) return { answer: '', demo: true };
    return { answer: text, demo: false };
  } catch {
    return { answer: '', demo: true };
  }
}
