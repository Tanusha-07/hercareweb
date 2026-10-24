import type { LocalizedText } from '@/types';

/** Static, reviewed content used across About, Journal and onboarding. */

export interface AboutStep {
  id: string;
  icon: string;
  title: LocalizedText;
  body: LocalizedText;
}

export const aboutSteps: AboutStep[] = [
  {
    id: 'find-doctor',
    icon: 'Search',
    title: { en: 'Find a doctor', hi: 'डॉक्टर खोजें', kn: 'ವೈದ್ಯರನ್ನು ಹುಡುಕಿ' },
    body: {
      en: 'Open “Find your doctor”, pick your state, district, block and village, then use filters like government, free, or female doctor.',
      hi: '“अपने डॉक्टर खोजें” खोलें, राज्य, ज़िला, ब्लॉक और गाँव चुनें, फिर सरकारी, मुफ़्त या महिला डॉक्टर जैसे फ़िल्टर लगाएँ।',
      kn: '“ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಹುಡುಕಿ” ತೆರೆಯಿರಿ, ರಾಜ್ಯ, ಜಿಲ್ಲೆ, ಬ್ಲಾಕ್ ಮತ್ತು ಹಳ್ಳಿ ಆಯ್ಕೆಮಾಡಿ, ನಂತರ ಸರ್ಕಾರಿ, ಉಚಿತ ಅಥವಾ ಮಹಿಳಾ ವೈದ್ಯೆ ಫಿಲ್ಟರ್ ಹಾಕಿ.',
    },
  },
  {
    id: 'dashboards',
    icon: 'LayoutDashboard',
    title: { en: 'Use health dashboards', hi: 'स्वास्थ्य डैशबोर्ड इस्तेमाल करें', kn: 'ಆರೋಗ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಬಳಸಿ' },
    body: {
      en: 'Under “My Health” you can track your cycle, a pregnancy and your baby, or general and elder health.',
      hi: '“मेरा स्वास्थ्य” में आप अपना चक्र, गर्भावस्था व शिशु, या सामान्य व वृद्ध स्वास्थ्य दर्ज कर सकती हैं।',
      kn: '“ನನ್ನ ಆರೋಗ್ಯ” ಅಡಿಯಲ್ಲಿ ಚಕ್ರ, ಗರ್ಭ ಮತ್ತು ಮಗು, ಅಥವಾ ಸಾಮಾನ್ಯ ಮತ್ತು ಹಿರಿಯರ ಆರೋಗ್ಯ ದಾಖಲಿಸಿ.',
    },
  },
  {
    id: 'awareness',
    icon: 'BookOpen',
    title: { en: 'Read health lessons', hi: 'स्वास्थ्य पाठ पढ़ें', kn: 'ಆರೋಗ್ಯ ಪಾಠ ಓದಿ' },
    body: {
      en: '“Awareness today, healthier tomorrow” has short lessons you can read or listen to, even offline once loaded.',
      hi: '“आज जागरूकता, कल स्वस्थ” में छोटे पाठ हैं जिन्हें आप पढ़ या सुन सकते हैं, लोड होने के बाद ऑफ़लाइन भी।',
      kn: '“ಇಂದು ಜಾಗೃತಿ, ನಾಳೆ ಆರೋಗ್ಯ” ನಲ್ಲಿ ಸಣ್ಣ ಪಾಠಗಳಿವೆ — ಓದಿ ಅಥವಾ ಕೇಳಿ, ಲೋಡ್ ಆದ ಮೇಲೆ ಆಫ್‌ಲೈನ್‌ನಲ್ಲೂ.',
    },
  },
  {
    id: 'voice',
    icon: 'Mic',
    title: { en: 'Voice and audio', hi: 'आवाज़ और ऑडियो', kn: 'ಧ್ವನಿ ಮತ್ತು ಆಡಿಯೋ' },
    body: {
      en: 'Tap the microphone to speak your question, and the speaker to hear guidance read aloud in your language.',
      hi: 'प्रश्न बोलने के लिए माइक दबाएँ, और अपनी भाषा में मार्गदर्शन सुनने के लिए स्पीकर दबाएँ।',
      kn: 'ಪ್ರಶ್ನೆ ಮಾತನಾಡಲು ಮೈಕ್ ಒತ್ತಿ, ಮತ್ತು ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಮಾರ್ಗದರ್ಶನ ಕೇಳಲು ಸ್ಪೀಕರ್ ಒತ್ತಿ.',
    },
  },
  {
    id: 'safety',
    icon: 'ShieldAlert',
    title: { en: 'Emergency and safety', hi: 'आपातकाल और सुरक्षा', kn: 'ತುರ್ತು ಮತ್ತು ಸುರಕ್ಷತೆ' },
    body: {
      en: 'The Safety page has emergency numbers and a report form. The leaf button jumps to a neutral page any time.',
      hi: 'सुरक्षा पेज पर आपातकालीन नंबर और रिपोर्ट फ़ॉर्म है। पत्ता बटन कभी भी तटस्थ पेज पर ले जाता है।',
      kn: 'ಸುರಕ್ಷತೆ ಪುಟದಲ್ಲಿ ತುರ್ತು ಸಂಖ್ಯೆಗಳು ಮತ್ತು ವರದಿ ಫಾರ್ಮ್ ಇದೆ. ಇಲೆ ಬಟನ್ ಯಾವಾಗ ಬೇಕಾದರೂ ತಟಸ್ಥ ಪುಟಕ್ಕೆ ಕೊಂಡೊಯ್ಯುತ್ತದೆ.',
    },
  },
  {
    id: 'privacy',
    icon: 'Lock',
    title: { en: 'Your privacy', hi: 'आपकी निजता', kn: 'ನಿಮ್ಮ ಗೌಪ್ಯತೆ' },
    body: {
      en: 'Your health records are stored on your own device and are not shared unless you choose to. On a shared device, log out when finished.',
      hi: 'आपके स्वास्थ्य रिकॉर्ड आपके डिवाइस पर रहते हैं और आपके चुनने पर ही साझा होते हैं। साझा डिवाइस पर काम खत्म होने पर लॉग आउट करें।',
      kn: 'ನಿಮ್ಮ ಆರೋಗ್ಯ ದಾಖಲೆಗಳು ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿ ಇರುತ್ತವೆ ಮತ್ತು ನೀವು ಆಯ್ಕೆ ಮಾಡಿದರೆ ಮಾತ್ರ ಹಂಚಿಕೆಯಾಗುತ್ತವೆ. ಹಂಚಿಕೆ ಸಾಧನದಲ್ಲಿ ಮುಗಿದ ಮೇಲೆ ಲಾಗ್ ಔಟ್ ಮಾಡಿ.',
    },
  },
];

export const affirmations: LocalizedText[] = [
  {
    en: 'Every day you choose care for yourself is a strong choice.',
    hi: 'जो हर दिन आप अपना ख्याल चुनती हैं, वह एक मज़बूत कदम है।',
    kn: 'ಪ್ರತಿದಿನ ನೀವು ನನ್ನ ಆರೈಕೆ ಆಯ್ಕೆ ಮಾಡುವುದು ಬಲಿಷ್ಠ ಹೆಜ್ಜೆ.',
  },
  {
    en: 'You are not alone. Asking for help is courage.',
    hi: 'आप अकेली नहीं हैं। मदद माँगना बहादुरी है।',
    kn: 'ನೀವು ಒಬ್ಬರಲ್ಲ. ಸಹಾಯ ಕೇಳುವುದು ಧೈರ್ಯ.',
  },
  {
    en: 'One hour at a time is enough for today.',
    hi: 'आज के लिए एक-एक घंटा काफ़ी है।',
    kn: 'ಇಂದಕ್ಕೆ ಒಂದೊಂದು ಗಂಟೆ ಸಾಕು.',
  },
  {
    en: 'Your body is healing. Be gentle with yourself.',
    hi: 'आपका शरीर ठीक हो रहा है। खुद के साथ कोमल रहें।',
    kn: 'ನಿಮ್ಮ ದೇಹ ಗುಣವಾಗುತ್ತಿದೆ. ತಮ್ಮೊಂದಿಗೆ ಮೃದುವಾಗಿರಿ.',
  },
];

export interface RecoveryStory {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
}

/**
 * Illustrative, consented-style recovery narratives. These are written as
 * generic composite stories for demonstration and must be replaced with
 * appropriately moderated, consented real stories before production.
 */
export const recoveryStories: RecoveryStory[] = [
  {
    id: 'story-1',
    title: { en: 'I started with one day', hi: 'मैंने एक दिन से शुरू किया', kn: 'ನಾನು ಒಂದು ದಿನದಿಂದ ಪ್ರಾರಂಭಿಸಿದೆ' },
    body: {
      en: 'I did not think I could change. I only promised today. Each small win made the next one easier.',
      hi: 'मुझे लगा मैं बदल नहीं सकती। मैंने केवल आज का वादा किया। हर छोटी सफलता अगली को आसान बनाती गई।',
      kn: 'ನಾನು ಬದಲಾಗಲು ಸಾಧ್ಯ ಎಂದು ಅನಿಸಲಿಲ್ಲ. ನಾನು ಇಂದಿಗೆ ಮಾತ್ರ ಗುರುತಿಸಿದೆ. ಸಣ್ಣ ಗೆಲುವು ಮುಂದಿನದು ಸುಲಭ ಮಾಡಿತು.',
    },
  },
  {
    id: 'story-2',
    title: { en: 'Talking helped', hi: 'बात करने से मदद मिली', kn: 'ಮಾತನಾಡುವುದರಿಂದ ಸಹಾಯವಾಯಿತು' },
    body: {
      en: 'Telling one trusted person took the shame away. A counsellor helped me make a safe plan.',
      hi: 'एक भरोसेमंद को बताने से शर्म घटी। एक काउंसलर ने सुरक्षित योजना बनाने में मदद की।',
      kn: 'ಒಬ್ಬ ನಂಬಿಕೆಯವರಿಗೆ ಹೇಳಿದರೆ ನಾಚಿಕೆ ಹೋಯಿತು. ಸಲಹೆಗಾರರು ಸುರಕ್ಷಿತ ಯೋಜನೆ ಮಾಡಲು ಸಹಾಯ ಮಾಡಿದರು.',
    },
  },
];
