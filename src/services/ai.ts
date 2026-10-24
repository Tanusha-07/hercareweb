import type { Language, TriageResult } from '@/types';
import { EMERGENCY_NUMBER } from '@/data/helplines';

/**
 * AI assistant provider abstraction.
 *
 * Safety-first design:
 *  1. A deterministic, clinically-reviewed emergency keyword layer runs BEFORE
 *     anything else, on-device, in all three languages. If it fires, the UI
 *     interrupts routine conversation with a "call emergency" action.
 *  2. General answers come from the backend when an AI provider is configured.
 *     When it is NOT configured, we fall back to a clearly-labelled demo mode
 *     built from curated educational content — never pretending a live model,
 *     translation service or medical database is connected.
 *
 * The browser never holds an AI API key; requests go to /api/assistant.
 */

export interface AssistantAnswer {
  text: string;
  emergency: TriageResult | null;
  visualId?: string;
  /** True when answered from curated demo content, not a live model. */
  demo: boolean;
}

/** Red-flag phrases per language. Kept broad to over-trigger toward safety. */
const EMERGENCY_TERMS: Record<Language, { id: string; terms: string[] }[]> = {
  en: [
    { id: 'bleeding', terms: ['heavy bleeding', 'bleeding a lot', 'hemorrhage', 'haemorrhage', 'bleeding after delivery', 'bleeding in pregnancy'] },
    { id: 'chest_pain', terms: ['chest pain', 'heart attack'] },
    { id: 'breathing', terms: ["can't breathe", 'cant breathe', 'can not breathe', 'breathing difficulty', 'trouble breathing', 'not breathing'] },
    { id: 'unconscious', terms: ['unconscious', 'passed out', 'not waking', 'fainted'] },
    { id: 'seizure', terms: ['seizure', 'fits', 'convulsion'] },
    { id: 'stroke', terms: ['stroke', 'face droop', 'cannot move one side', 'slurred speech'] },
    { id: 'allergy', terms: ['severe allergy', 'throat closing', 'anaphylaxis'] },
    { id: 'danger', terms: ['someone is hurting me', 'being attacked', 'violence', 'domestic violence', 'in danger'] },
    { id: 'self_harm', terms: ['hurt myself', 'kill myself', 'end my life', 'suicide'] },
  ],
  hi: [
    { id: 'bleeding', terms: ['अधिक रक्तस्राव', 'खून बहुत', 'रक्तस्राव'] },
    { id: 'chest_pain', terms: ['सीने में दर्द', 'छाती में दर्द'] },
    { id: 'breathing', terms: ['साँस नहीं', 'साँस लेने में कठिनाई', 'श्वास'] },
    { id: 'unconscious', terms: ['बेहोश', 'ज्ञान नहीं', 'बेहोशी'] },
    { id: 'seizure', terms: ['मिर्गी', 'दौरा', 'बात'] },
    { id: 'stroke', terms: ['स्ट्रोक', 'चेहरा लटक'] },
    { id: 'danger', terms: ['कोई मार रहा', 'मारपीट', 'खतरा', 'हिंसा'] },
    { id: 'self_harm', terms: ['खुद को नुकसान', 'आत्महत्या'] },
  ],
  kn: [
    { id: 'bleeding', terms: ['ಅಧಿಕ ರಕ್ತಸ್ರಾವ', 'ರಕ್ತಸ್ರಾವ'] },
    { id: 'chest_pain', terms: ['ಎದೆಯ ನೋವು'] },
    { id: 'breathing', terms: ['ಉಸಿರಾಟದ ತೊಂದರೆ', 'ಉಸಿ ಬಿಡುವುದಿಲ್ಲ'] },
    { id: 'unconscious', terms: ['ಸ್ನಾನ', 'ಸ್ಪೃಶಾಟಿಲ್ಲ', 'ಮೂರ್ಛೆ'] },
    { id: 'seizure', terms: ['ಮೂರ್ಛೆ ರೋಗ', 'ಸವಲೆ'] },
    { id: 'stroke', terms: ['ಸ್ಟ್ರೋಕ್', 'ಮುಖ ಜಾರು'] },
    { id: 'danger', terms: ['ಯಾರೋ ಹೊಡೆಯುತ್ತಾರೆ', 'ಹಿಂಸೆ', 'ಅಪಾಯ'] },
    { id: 'self_harm', terms: ['ನನ್ನನ್ನು ನಾನು ಹಾನಿ', 'ಆತ್ಮಹತ್ಯೆ'] },
  ],
};

const EMERGENCY_COPY: Record<Language, { headline: string; guidance: string[] }> = {
  en: {
    headline: 'This may be an emergency. Please get help now.',
    guidance: [
      `Call ${EMERGENCY_NUMBER} or go to the nearest hospital right away.`,
      'Do not wait. Ask someone nearby to help you.',
    ],
  },
  hi: {
    headline: 'यह आपातकाल हो सकता है। कृपया अभी सहायता लें।',
    guidance: [
      `तुरंत ${EMERGENCY_NUMBER} पर कॉल करें या नज़दीकी अस्पताल जाएँ।`,
      'इंतज़ार न करें। पास के किसी से मदद माँगें।',
    ],
  },
  kn: {
    headline: 'ಇದು ತುರ್ತು ಆಗಿರಬಹುದು. ದಯವಿಟ್ಟು ಈಗ ಸಹಾಯ ಪಡೆಯಿರಿ.',
    guidance: [
      `ತಕ್ಷಣ ${EMERGENCY_NUMBER} ಕರೆ ಮಾಡಿ ಅಥವಾ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಿ.`,
      'ಕಾಯಬೇಡಿ. ಪಕ್ಕದ ಯಾರಿಗಾದರೂ ಸಹಾಯ ಕೇಳಿ.',
    ],
  },
};

/** Deterministic emergency detection. Returns a triage result or null. */
export function detectEmergency(text: string, lang: Language): TriageResult | null {
  const lower = text.toLowerCase();
  const matched = EMERGENCY_TERMS[lang].some((r) => r.terms.some((t) => lower.includes(t.toLowerCase())))
    ? 'matched'
    : // Also scan the other languages, since a user may type in any script.
      (Object.keys(EMERGENCY_TERMS) as Language[]).some((l) =>
        EMERGENCY_TERMS[l].some((r) => r.terms.some((t) => lower.includes(t.toLowerCase()))),
      )
        ? 'matched'
        : null;

  if (!matched) return null;
  const copy = EMERGENCY_COPY[lang];
  return {
    level: 'red',
    headline: copy.headline,
    guidance: copy.guidance,
    triggeredBy: ['assistant-emergency'],
  };
}

/** Curated demo answers keyed by simple topic matchers. */
const DEMO_TOPICS: { match: string[]; en: string; hi: string; kn: string; visualId?: string }[] = [
  {
    match: ['water', 'dehydration', 'thirst', 'पानी', 'निर्जलीकरण', 'ನೀರು', 'ನಿರ್ಜಲೀಕರಣ'],
    en: 'Drink clean water through the day. Dark urine, headache or dizziness can mean you need more. If vomiting stops you drinking, or you feel confused, get medical care.',
    hi: 'दिन भर साफ़ पानी पिएँ। गहरा पेशाब, सिरदर्द या चक्कर पानी की कमी बता सकते हैं। यदि उल्टी से पानी न पी पाएँ या भ्रम हो, तो चिकित्सा सहायता लें।',
    kn: 'ದಿನವಿಡಿ ಶುಚಿ ನೀರು ಕುಡಿಯಿರಿ. ಗಾಢ ಮೂತ್ರ, ತಲೆನೋವು ಅಥವಾ ತಲೆತಿರುಗುವಿಕೆ ನೀರಿನ ಕೊರತೆ ತೋರಿಸಬಹುದು. ವಾಂತಿಯಿಂದ ನೀರು ಕುಡಿಯಲಾಗದರೆ ಅಥವಾ ಗೊಂದಲವಾದರೆ ವೈದ್ಯಕೀಯ ಸಹಾಯ ಪಡೆಯಿರಿ.',
    visualId: 'hydration',
  },
  {
    match: ['iron', 'anaemia', 'anemia', 'tired', 'आयरन', 'रक्ताल्पता', 'कब्बिण', 'ರಕ್ತಹೀನತೆ'],
    en: 'Feeling very tired and pale can be anaemia. Iron-rich food like green leaves, beans and jaggery helps, and a health worker can check your blood. This is general advice, not a diagnosis.',
    hi: 'बहुत थकान और पीलापन रक्ताल्पता हो सकती है। हरी पत्तियाँ, फलियाँ और गुड़ जैसे आयरन युक्त भोजन मदद करता है, और स्वास्थ्य कार्यकर्ता आपका रक्त जाँच सकते हैं। यह सामान्य सलाह है, निदान नहीं।',
    kn: 'ತೀವ್ರ ಆಯಾಸ ಮತ್ತು ಬಣ್ಣಬಿಳಿ ರಕ್ತಹೀನತೆ ಇರಬಹುದು. ಹಸಿರು ಎಲೆ, ಬೇಳೆ, ಬೆಲ್ಲದ ಕಬ್ಬಿಣ ಆಹಾರ ಸಹಾಯ. ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರು ರಕ್ತ ಪರೀಕ್ಷಿಸಬಹುದು. ಇದು ಸಾಮಾನ್ಯ ಸಲಹೆ, ರೋಗನಿರ್ಣಯ ಅಲ್ಲ.',
  },
  {
    match: ['period', 'menstrual', 'मासिक', 'पीरियड', 'ಮಾಸಿಕ'],
    en: 'A period is normal. Change your pad or cloth every 4 to 6 hours and wash with clean water. See a health worker for very heavy bleeding, severe pain, or fever with bad smell.',
    hi: 'मासिक धर्म सामान्य है। हर 4 से 6 घंटे में नैपकिन या कपड़ा बदलें और साफ़ पानी से धोएँ। अधिक रक्तस्राव, तेज़ दर्द, या बदबू वाले बुखार पर स्वास्थ्य कार्यकर्ता से मिलें।',
    kn: 'ಮಾಸಿಕ ಸಾಮಾನ್ಯ. ಪ್ರತಿ 4 ರಿಂದ 6 ಗಂಟೆಗೆ ಪ್ಯಾಡ್/ಬಟ್ಟೆ ಬದಲಿಸಿ ಮತ್ತು ಶುಚಿ ನೀರಿನಿಂದ ತೊಳೆಯಿರಿ. ಅಧಿಕ ರಕ್ತಸ್ರಾವ, ತೀವ್ರ ನೋವು, ದುರ್ಗಂಧದ ಜ್ವರಕ್ಕೆ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರನ್ನು ಭೇಟಿ ಮಾಡಿ.',
  },
  {
    match: ['pregnan', 'गर्भ', 'प्रसव', 'ಗರ್ಭ'],
    en: 'If you are pregnant, keep regular antenatal check-ups and take iron and folic acid as advised. Get urgent help for heavy bleeding, fits, severe headache with blurred vision, or the baby moving much less.',
    hi: 'यदि आप गर्भवती हैं, तो नियमित एएनसी जाँच कराएँ और सलाह अनुसार आयरन व फोलिक एसिड लें। अधिक रक्तस्राव, दौरा, धुंधली दृष्टि वाले तेज़ सिरदर्द, या शिशु के कम हिलने पर तुरंत सहायता लें।',
    kn: 'ನೀವು ಗರ್ಭಿಣಿಯಾಗಿದ್ದರೆ, ನಿಯಮಿತ ಎಎನ್‌ಸಿ ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ ಮತ್ತು ಸೂಚಿಸಿದಂತೆ ಕಬ್ಬಿಣ/ಫೋಲಿಕ್ ತೆಗೆದುಕೊಳ್ಳಿ. ಅಧಿಕ ರಕ್ತಸ್ರಾವ, ಸವಲೆ, ಮಂಜಿನೊಂದಿಗೆ ತೀವ್ರ ತಲೆನೋವು, ಅಥವಾ ಮಗು ಕಡಿಮೆ ಅಲುಗಾಡಿದರೆ ತಕ್ಷಣ ಸಹಾಯ ಪಡೆಯಿರಿ.',
  },
];

function demoAnswer(text: string, lang: Language): AssistantAnswer {
  const lower = text.toLowerCase();
  const topic = DEMO_TOPICS.find((t) => t.match.some((m) => lower.includes(m.toLowerCase())));
  const body = topic
    ? { en: topic.en, hi: topic.hi, kn: topic.kn }[lang]
    : {
        en: 'I can share general health information from reviewed lessons, but I am not a doctor and cannot diagnose. Please tell me a little more, or use “Find your doctor” to get personal care.',
        hi: 'मैं समीक्षित पाठों से सामान्य स्वास्थ्य जानकारी दे सकती हूँ, पर मैं डॉक्टर नहीं हूँ और निदान नहीं कर सकती। कृपया थोड़ा और बताएँ, या व्यक्तिगत देखभाल के लिए “अपने डॉक्टर खोजें” इस्तेमाल करें।',
        kn: 'ನಾನು ಪರಿಶೀಲಿತ ಪಾಠಗಳಿಂದ ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ಮಾಹಿತಿ ಕೊಡಬಹುದು, ಆದರೆ ನಾನು ವೈದ್ಯರಲ್ಲ ಮತ್ತು ರೋಗನಿರ್ಣಯ ಮಾಡಲಾರೆ. ಸ್ವಲ್ಪ ಹೆಚ್ಚು ಹೇಳಿ, ಅಥವಾ "ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಹುಡುಕಿ" ಬಳಸಿ.',
      }[lang];
  return { text: body, emergency: null, visualId: topic?.visualId, demo: true };
}

/**
 * Ask the assistant. Emergency detection always runs first. General answers go
 * to the backend if available; otherwise we use the safe demo mode.
 */
export async function askAssistant(text: string, lang: Language): Promise<AssistantAnswer> {
  const emergency = detectEmergency(text, lang);
  if (emergency) {
    return {
      text: emergency.headline,
      emergency,
      demo: false,
    };
  }

  try {
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, lang }),
      credentials: 'same-origin',
    });
    if (res.ok) {
      const data = (await res.json()) as { answer?: string; demo?: boolean; visualId?: string };
      if (typeof data.answer === 'string' && data.demo === false) {
        return { text: data.answer, emergency: null, visualId: data.visualId, demo: false };
      }
    }
  } catch {
    /* fall through to demo */
  }

  return demoAnswer(text, lang);
}
