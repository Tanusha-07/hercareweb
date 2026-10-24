import type { Helpline } from '@/types';

/**
 * Verified national emergency and support numbers for India.
 *
 * These are public, well-known government helplines. They are kept in a data
 * file (not hard-coded in components) so they can be updated without touching
 * UI code, per the project brief. Numbers are dialled through tel: links only —
 * the app never places a call automatically.
 */
export const helplines: Helpline[] = [
  {
    id: 'emergency-112',
    number: '112',
    availability: 'national',
    name: {
      en: 'National Emergency',
      hi: 'राष्ट्रीय आपातकाल',
      kn: 'ರಾಷ್ಟ್ರೀಯ ತುರ್ತು',
    },
    description: {
      en: 'Police, fire and medical emergency. Works across all of India.',
      hi: 'पुलिस, अग्नि और चिकित्सा आपातकाल। पूरे भारत में काम करता है।',
      kn: 'ಪೊಲೀಸ್, ಬೆಂಕಿ ಮತ್ತು ವೈದ್ಯಕೀಯ ತುರ್ತು. ಇಡೀ ಭಾರತದಲ್ಲಿ ಕೆಲಸ ಮಾಡುತ್ತದೆ.',
    },
  },
  {
    id: 'women-181',
    number: '181',
    availability: 'state',
    name: {
      en: 'Women Helpline',
      hi: 'महिला हेल्पलाइन',
      kn: 'ಮಹಿಳಾ ಹೆಲ್ಪ್‌ಲೈನ್',
    },
    description: {
      en: 'Support for women in distress. Availability and services vary by state.',
      hi: 'संकट में महिलाओं के लिए सहायता। उपलब्धता और सेवाएँ राज्य के अनुसार भिन्न।',
      kn: 'ಸಂಕಟದಲ್ಲಿರುವ ಮಹಿಳೆಯರಿಗೆ ಬೆಂಬಲ. ಲಭ್ಯತೆ ಮತ್ತು ಸೇವೆಗಳು ರಾಜ್ಯಾನುಸಾರ ಬದಲಾಗುತ್ತವೆ.',
    },
  },
  {
    id: 'child-1098',
    number: '1098',
    availability: 'national',
    name: {
      en: 'Child Helpline',
      hi: 'बाल हेल्पलाइन',
      kn: 'ಮಕ್ಕಳ ಹೆಲ್ಪ್‌ಲೈನ್',
    },
    description: {
      en: 'Help and protection for children in need of care and protection.',
      hi: 'देखभाल और सुरक्षा की ज़रूरत वाले बच्चों के लिए सहायता।',
      kn: 'ಆರೈಕೆ ಮತ್ತು ಸುರಕ್ಷತೆ ಅಗತ್ಯವಿರುವ ಮಕ್ಕಳಿಗಾಗಿ ಸಹಾಯ.',
    },
  },
];

/** Convenience lookups used by the safety page and emergency triage. */
export const EMERGENCY_NUMBER = '112';
export const WOMEN_HELPLINE_NUMBER = '181';

export function findHelpline(id: string): Helpline | undefined {
  return helplines.find((h) => h.id === id);
}
