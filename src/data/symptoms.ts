import type { Symptom, TriageLevel, TriageResult, Language } from '@/types';
import { pick } from '@/types';

/**
 * Everyday-language symptom catalogue for the General Health triage.
 *
 * These feed a deterministic, rule-based triage (see triage.ts). They are
 * deliberately NOT a diagnosis. Severity here is a *baseline*; the triage
 * layer also weighs duration and how strong the person feels.
 */
export const symptoms: Symptom[] = [
  { id: 'fever', icon: 'Thermometer', severity: 'amber', category: 'general', label: { en: 'Fever', hi: 'बुखार', kn: 'ಜ್ವರ' } },
  { id: 'headache', icon: 'Brain', severity: 'green', category: 'general', label: { en: 'Headache', hi: 'सिरदर्द', kn: 'ತಲೆನೋವು' } },
  { id: 'dizziness', icon: 'Dizzy', severity: 'amber', category: 'general', label: { en: 'Dizziness', hi: 'चक्कर', kn: 'ತಲೆತಿರುಗುವಿಕೆ' } },
  { id: 'joint_pain', icon: 'Bone', severity: 'green', category: 'elder', label: { en: 'Joint pain', hi: 'जोड़ों का दर्द', kn: 'ಸಂಧಿ ನೋವು' } },
  { id: 'blurry_vision', icon: 'Eye', severity: 'amber', category: 'elder', label: { en: 'Blurry vision', hi: 'धुंधला दिखना', kn: 'ಮಂಜುಗಾಣಿಕೆ' } },
  { id: 'weakness', icon: 'BatteryLow', severity: 'green', category: 'general', label: { en: 'Weakness / tired', hi: 'कमज़ोरी / थकान', kn: 'ದೌರ್ಬಲ್ಯ / ಆಯಾಸ' } },
  { id: 'cough', icon: 'Wind', severity: 'green', category: 'general', label: { en: 'Cough / cold', hi: 'खांसी / सर्दी', kn: 'ಕೆಮ್ಮು / ನೆಗಡಿ' } },
  { id: 'stomach_pain', icon: 'Stethoscope', severity: 'amber', category: 'general', label: { en: 'Stomach pain', hi: 'पेट में दर्द', kn: 'ಹೊಟ್ಟೆ ನೋವು' } },

  // Emergency red flags — always push the result to RED.
  { id: 'breathing_difficulty', icon: 'Siren', severity: 'red', category: 'emergency', label: { en: 'Trouble breathing', hi: 'साँस लेने में कठिनाई', kn: 'ಉಸಿರಾಟದ ತೊಂದರೆ' } },
  { id: 'chest_pain', icon: 'HeartCrack', severity: 'red', category: 'emergency', label: { en: 'Sudden chest pain', hi: 'अचानक सीने में दर्द', kn: 'ಹಠಾತ್ ಎದೆಯ ನೋವು' } },
  { id: 'fainting', icon: 'Siren', severity: 'red', category: 'emergency', label: { en: 'Fainted / not conscious', hi: 'बेहोशी / ज्ञान नहीं', kn: 'ಸ್ನಾನ / ಸ್ಪೃಶಾಟಿಲ್ಲ' } },
  { id: 'seizure', icon: 'Siren', severity: 'red', category: 'emergency', label: { en: 'Seizure / fits', hi: 'मिर्गी / दौरा', kn: 'ಮೂರ್ಛೆ ರೋಗ / ಸವಲೆ' } },
  { id: 'stroke_signs', icon: 'Siren', severity: 'red', category: 'emergency', label: { en: 'Face droop / one-side weakness', hi: 'चेहरा लटकना / एक ओर कमज़ोरी', kn: 'ಮುಖ ಜಾರುವಿಕೆ / ಒಂದು ಕಡೆ ದೌರ್ಬಲ್ಯ' } },
  { id: 'heavy_bleeding', icon: 'Siren', severity: 'red', category: 'emergency', label: { en: 'Heavy bleeding', hi: 'अधिक रक्तस्राव', kn: 'ಅಧಿಕ ರಕ್ತಸ್ರಾವ' } },
  { id: 'allergic_reaction', icon: 'Siren', severity: 'red', category: 'emergency', label: { en: 'Severe allergy / swelling', hi: 'गंभीर एलर्जी / सूजन', kn: 'ತೀವ್ರ ಅಲರ್ಜಿ / ಊತ' } },
];

export function getSymptom(id: string): Symptom | undefined {
  return symptoms.find((s) => s.id === id);
}

const rank: Record<TriageLevel, number> = { green: 0, amber: 1, red: 2 };

export interface TriageInput {
  symptomIds: string[];
  duration: 'days1to3' | 'week' | 'longer';
  severity: 'mild' | 'moderate' | 'severe';
  lang: Language;
}

/**
 * Deterministic triage. Any emergency symptom => RED. Otherwise a persistent
 * or severe complaint, or several amber symptoms => AMBER. Everything else =>
 * GREEN. This never claims a diagnosis; the UI always shows a disclaimer.
 */
export function runTriage({ symptomIds, duration, severity, lang }: TriageInput): TriageResult {
  const chosen = symptomIds.map(getSymptom).filter((s): s is Symptom => Boolean(s));
  const triggeredBy = chosen.map((s) => s.id);

  const emergencies = chosen.filter((s) => s.severity === 'red');
  const ambers = chosen.filter((s) => s.severity === 'amber');

  let level: TriageLevel = 'green';
  if (emergencies.length > 0) {
    level = 'red';
  } else if (
    chosen.length === 0
      ? false
      : severity === 'severe' ||
        (duration === 'longer' && ambers.length > 0) ||
        ambers.length >= 3 ||
        (ambers.length > 0 && severity === 'moderate')
  ) {
    level = 'amber';
  } else if (ambers.length > 0 || duration === 'longer') {
    level = 'amber';
  }

  const copy: Record<TriageLevel, { headline: { [k in Language]: string }; guidance: { [k in Language]: string }[] }> = {
    green: {
      headline: {
        en: 'Self-care may be suitable',
        hi: 'घरेलू देखभाल उपयुक्त हो सकती है',
        kn: 'ಸ್ವ-ಆರೈಕೆ ಸೂಕ್ತವಾಗಿರಬಹುದು',
      },
      guidance: [
        {
          en: 'Rest, drink clean water, and eat simple home food. Watch how you feel.',
          hi: 'आराम करें, साफ़ पानी पिएँ, और साधारण घर का खाना खाएँ। अपने आप पर ध्यान रखें।',
          kn: 'ವಿಶ್ರಾಂತಿ ತೆಗೆಕೊಳ್ಳಿ, ಶುಚಿ ನೀರು ಕುಡಿಯಿರಿ, ಸರಳ ಊಟ ಮಾಡಿ. ನಿಮ್ಮ ಮೇಲೆ ಗಮನ ಇಡಿ.',
        },
        {
          en: 'If it gets worse, lasts more than a few days, or you feel worried, see a health worker.',
          hi: 'बिगड़ने पर, कई दिन रहने पर, या चिंता होने पर स्वास्थ्य कार्यकर्ता से मिलें।',
          kn: 'ಮೆಲಾಗುತ್ತಿದ್ದರೆ, ಹಲವು ದಿನ ಇದ್ದರೆ, ಅಥವಾ ಚಿಂತೆ ಆದರೆ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರನ್ನು ಭೇಟಿ ಮಾಡಿ.',
        },
      ],
    },
    amber: {
      headline: {
        en: 'Speak to a health worker or clinic soon',
        hi: 'जल्द स्वास्थ्य कार्यकर्ता या क्लिनिक से मिलें',
        kn: 'ಬೇಗ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರನ್ನು ಅಥವಾ ಕ್ಲಿನಿಕ್ ಭೇಟಿ ಮಾಡಿ',
      },
      guidance: [
        {
          en: 'These signs should be checked by a health worker or clinic soon.',
          hi: 'इन लक्षणों को जल्द स्वास्थ्य कार्यकर्ता या क्लिनिक से जाँचवाना चाहिए।',
          kn: 'ಈ ಲಕ್ಷಣಗಳನ್ನು ಬೇಗ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತೆ ಅಥವಾ ಕ್ಲಿನಿಕ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಬೇಕು.',
        },
        {
          en: 'Use “Find your doctor” to locate a nearby centre.',
          hi: 'पास का केंद्र खोजने के लिए “अपने डॉक्टर खोजें” इस्तेमाल करें।',
          kn: 'ಹತ್ತಿರದ ಕೇಂದ್ರ ಹುಡುಕಲು “ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಹುಡುಕಿ” ಬಳಸಿ.',
        },
      ],
    },
    red: {
      headline: {
        en: 'Get emergency help now',
        hi: 'अभी आपातकालीन सहायता लें',
        kn: 'ಈಗ ತುರ್ತು ಸಹಾಯ ಪಡೆಯಿರಿ',
      },
      guidance: [
        {
          en: 'This can be a medical emergency. Call 112 or go to the nearest hospital right away.',
          hi: 'यह चिकित्सा आपातकाल हो सकता है। तुरंत 112 पर कॉल करें या नज़दीकी अस्पताल जाएँ।',
          kn: 'ಇದು ವೈದ್ಯಕೀಯ ತುರ್ತು ಆಗಿರಬಹುದು. ತಕ್ಷಣ 112 ಕರೆ ಮಾಡಿ ಅಥವಾ ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗೆ ಹೋಗಿ.',
        },
        {
          en: 'Do not wait. Ask someone nearby to help you.',
          hi: 'इंतज़ार न करें। पास के किसी से मदद माँगें।',
          kn: 'ಕಾಯಬೇಡಿ. ಪಕ್ಕದ ಯಾರಿಗಾದರೂ ಸಹಾಯ ಕೇಳಿ.',
        },
      ],
    },
  };

  return {
    level,
    headline: pick(copy[level].headline, lang),
    guidance: copy[level].guidance.map((g) => pick(g, lang)),
    triggeredBy: level === 'red' ? emergencies.map((s) => s.id) : triggeredBy,
  };
}

/** Rank helper reused by the AI safety layer. */
export function maxLevel(a: TriageLevel, b: TriageLevel): TriageLevel {
  return rank[a] >= rank[b] ? a : b;
}
