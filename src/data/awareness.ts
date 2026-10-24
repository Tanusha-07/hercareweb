import type { AwarenessArticle, AwarenessCategory } from '@/types';

/**
 * Health-education articles. Content is deliberately general, reviewed
 * public-health information written in short, plain sentences. It never
 * invents medical facts, never presents unverified traditional remedies as
 * proven, and always points to a professional for personal decisions.
 *
 * Sources reference well-known public guidance (WHO / India's Ministry of
 * Health & Family Welfare / NHM). Replace with locally reviewed material
 * before clinical deployment.
 */
export const awarenessArticles: AwarenessArticle[] = [
  {
    id: 'menstrual-hygiene',
    category: 'lifecycle',
    icon: 'Droplet',
    title: { en: 'Your period and staying clean', hi: 'आपकी मासिक धर्म और सफाई', kn: 'ನಿಮ್ಮ ಮಾಸಿಕ ಮತ್ತು ಶುಚಿತ್ವ' },
    summary: {
      en: 'A period is normal and healthy. Clean habits keep you comfortable.',
      hi: 'मासिक धर्म सामान्य और स्वस्थ है। सफाई आदतें आपको सहज रखती हैं।',
      kn: 'ಮಾಸಿಕ ಸಾಮಾನ್ಯ ಮತ್ತು ಆರೋಗ್ಯಕರ. ಶುಚಿ ಅಭ್ಯಾಸಗಳು ನಿಮ್ಮನ್ನು ಸೌಕರ್ಯವಾಗಿ ಇಡುತ್ತವೆ.',
    },
    body: [
      {
        en: 'Change your pad or cloth at least every 4 to 6 hours, or more often if needed.',
        hi: 'अपनी सैनिटरी नैपकिन या कपड़ा कम से कम हर 4 से 6 घंटे में बदलें, ज़रूरत हो तो अधिक।',
        kn: 'ನಿಮ್ಮ ಪ್ಯಾಡ್ ಅಥವಾ ಬಟ್ಟೆಯನ್ನು ಕನಿಷ್ಠ ಪ್ರತಿ 4 ರಿಂದ 6 ಗಂಟೆಗೆ ಬದಲಿಸಿ, ಬೇಕಿದ್ದರೆ ಹೆಚ್ಚು.',
      },
      {
        en: 'Wash with clean water and soap. You do not need special washes inside the body.',
        hi: 'साफ़ पानी और साबुन से धोएँ। शरीर के अंदर धोने की ज़रूरत नहीं है।',
        kn: 'ಶುಚಿ ನೀರು ಮತ್ತು ಸಾಬೂನಿನಿಂದ ತೊಳೆಯಿರಿ. ದೇಹದ ಒಳಗೆ ತೊಳೆಯುವ ಅಗತ್ಯ ಇಲ್ಲ.',
      },
      {
        en: 'Dry cloth in sunlight kills germs. Keep a clean spare folded separately.',
        hi: 'कपड़े को धूप में सुखाने से कीटाणु मरते हैं। साफ़ अतिरिक्त कपड़ा अलग मोड़कर रखें।',
        kn: 'ಬಟ್ಟೆಯನ್ನು ಕಿರಣದಲ್ಲಿ ಒಣಗಿಸಿದರೆ ಕೀಟಾಣುಗಳು ಸಾಯುತ್ತವೆ. ಶುಚಿ ಹೆಚ್ಚುವರಿ ಬಟ್ಟೆಯನ್ನು ಪ್ರತ್ಯೇಕವಾಗಿ ಇಡಿ.',
      },
    ],
    seekHelp: {
      en: 'See a health worker if you have very heavy bleeding, severe pain, or a bad smell with fever.',
      hi: 'अधिक रक्तस्राव, तेज़ दर्द, या बुखार के साथ बदबू आने पर स्वास्थ्य कार्यकर्ता से मिलें।',
      kn: 'ಅಧಿಕ ರಕ್ತಸ್ರಾವ, ತೀವ್ರ ನೋವು, ಅಥವಾ ಜ್ವರದೊಂದಿಗೆ ದುರ್ಗಂಧ ಬಂದರೆ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರನ್ನು ಭೇಟಿ ಮಾಡಿ.',
    },
    source: 'WHO / India NHM menstrual hygiene guidance',
    nextStep: {
      label: { en: 'Find a health centre', hi: 'स्वास्थ्य केंद्र खोजें', kn: 'ಆರೋಗ್ಯ ಕೇಂದ್ರ ಹುಡುಕಿ' },
      to: '/find-doctor',
    },
  },
  {
    id: 'pregnancy-checkups',
    category: 'lifecycle',
    icon: 'HeartHandshake',
    title: { en: 'Antenatal check-ups', hi: 'गर्भावस्था जाँच', kn: 'ಗರ್ಭ ಪರೀಕ್ಷೆ' },
    summary: {
      en: 'Regular check-ups keep mother and baby safer.',
      hi: 'नियमित जाँच माँ और शिशु को अधिक सुरक्षित रखती है।',
      kn: 'ನಿಯಮಿತ ಪರೀಕ್ಷೆಗಳು ತಾಯಿ ಮತ್ತು ಮಗುವನ್ನು ಹೆಚ್ಚು ಸುರಕ್ಷಿತವಾಗಿಡುತ್ತವೆ.',
    },
    body: [
      {
        en: 'Visit a health worker as soon as you learn you are pregnant, and keep going regularly.',
        hi: 'गर्भ पता चलते ही स्वास्थ्य कार्यकर्ता से मिलें, और नियमित रूप से जाती रहें।',
        kn: 'ಗರ್ಭ ತಿಳಿದ ಕೂಡಲೇ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರನ್ನು ಭೇಟಿ ಮಾಡಿ, ನಿಯಮಿತವಾಗಿ ಹೋಗುತ್ತಿರಿ.',
      },
      {
        en: 'Take iron and folic acid tablets and any test your health worker advises.',
        hi: 'आयरन व फोलिक एसिड गोलियाँ लें और स्वास्थ्य कार्यकर्ता की सलाह अनुसार जाँच कराएँ।',
        kn: 'ಕಬ್ಬಿಣ ಮತ್ತು ಫೋಲಿಕ್ ಆಮ್ಲ ಮಾತ್ರೆ ಸೇವಿಸಿ, ಕಾರ್ಯಕರ್ತರು ಸೂಚಿಸಿದ ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ.',
      },
      {
        en: 'Ask about a birth plan and where you will deliver safely.',
        hi: 'सुरक्षित प्रसव की योजना और कहाँ डिलीवरी होगी, यह जानें।',
        kn: 'ಸುರಕ್ಷಿತ ಹುಟ್ಟಿಸುವ ಯೋಜನೆ ಮತ್ತು ಎಲ್ಲಿ ಹುಟ್ಟಿಸುತ್ತೀರಿ ಎಂದು ಕೇಳಿ.',
      },
    ],
    seekHelp: {
      en: 'Get urgent help for heavy bleeding, fits, severe headache with blurred vision, or the baby moving much less.',
      hi: 'अधिक रक्तस्राव, दौरा, धुंधली दृष्टि वाला तेज़ सिरदर्द, या शिशु के कम हिलने पर तुरंत सहायता लें।',
      kn: 'ಅಧಿಕ ರಕ್ತಸ್ರಾವ, ಸವಲೆ, ಮಂಜುಗಾಣಿಕೆಯೊಂದಿಗೆ ತೀವ್ರ ತಲೆನೋವು, ಅಥವಾ ಮಗು ಕಡಿಮೆ ಅಲುಗಾಡಿದರೆ ತಕ್ಷಣ ಸಹಾಯ ಪಡೆಯಿರಿ.',
    },
    source: 'India Ministry of Health & Family Welfare — ANC schedule',
    nextStep: {
      label: { en: 'Open mother & baby tracker', hi: 'माँ-शिशु रिकॉर्ड खोलें', kn: 'ತಾಯಿ-ಮಗು ದಾಖಲೆ ತೆರೆಯಿರಿ' },
      to: '/dashboard/pregnancy',
    },
  },
  {
    id: 'menopause',
    category: 'lifecycle',
    icon: 'Sun',
    title: { en: 'Menopause and healthy ageing', hi: 'रजोनिवृत्ति और स्वस्थ बुढ़ापा', kn: 'ಮೆನೋಪಾಸ್ ಮತ್ತು ಆರೋಗ್ಯಕರ ವಯಸ್ಕತೆ' },
    summary: {
      en: 'Periods stopping around mid-life is a normal stage.',
      hi: 'मध्य आयु में मासिक धर्म बंद होना एक सामान्य अवस्था है।',
      kn: 'ಮಧ್ಯ ವಯಸ್ಸಿನಲ್ಲಿ ಮಾಸಿಕ ನಿಲ್ಲುವುದು ಸಾಮಾನ್ಯ ಹಂತ.',
    },
    body: [
      {
        en: 'Many women stop periods between about 45 and 55. This is called menopause.',
        hi: 'कई महिलाओं की मासिक धर्म लगभग 45 से 55 वर्ष के बीच बंद हो जाती है। इसे रजोनिवृत्ति कहते हैं।',
        kn: 'ಹಲವು ಮಹಿಳೆಯರ ಮಾಸಿಕ ಸುಮಾರು 45 ರಿಂದ 55 ವರ್ಷದೊಳಗೆ ನಿಲ್ಲುತ್ತದೆ. ಇದನ್ನು ಮೆನೋಪಾಸ್ ಎನ್ನುತ್ತಾರೆ.',
      },
      {
        en: 'Warm flushes, mood changes and dry sleep are common. Calcium, protein and walking help bones.',
        hi: 'गर्मी का अहसास, मूड बदलना और नींद में दिक्कत आम है। कैल्शियम, प्रोटीन और टहलना हड्डियों को मज़बूत रखता है।',
        kn: 'ಬೆಚ್ಚನೆಯ ಅನುಭವ, ಮನೋಸ್ಥಿತಿ ಬದಲಾವಣೆ ಮತ್ತು ನಿದ್ರಾ ಸಮಸ್ಯೆ ಸಾಮಾನ್ಯ. ಕ್ಯಾಲ್ಸಿಯಂ, ಪ್ರೋಟೀನ್ ಮತ್ತು ನಡಿಗೆ ಮೂಳೆಗಳಿಗೆ ಒಳ್ಳೆಯದು.',
      },
    ],
    seekHelp: {
      en: 'Bleeding after menopause, or pain that worries you, should always be checked.',
      hi: 'रजोनिवृत्ति के बाद रक्तस्राव, या चिंता वाला दर्द, हमेशा जाँचवाना चाहिए।',
      kn: 'ಮೆನೋಪಾಸ್ ನಂತರ ರಕ್ತಸ್ರಾವ, ಅಥವಾ ಚಿಂತೆಗೊಳಿಸುವ ನೋವು ಯಾವಾಗಲೂ ಪರಿಶೀಲಿಸಬೇಕು.',
    },
    source: 'WHO menopause guidance',
  },
  {
    id: 'anaemia',
    category: 'prevention',
    icon: 'Utensils',
    title: { en: 'Preventing anaemia with iron', hi: 'आयरन से रक्ताल्पता रोकें', kn: 'ಕಬ್ಬಿಣದಿಂದ ರಕ್ತಹೀನತೆ ತಡೆಯಿರಿ' },
    summary: {
      en: 'Anaemia is common in women. Iron-rich food helps.',
      hi: 'महिलाओं में रक्ताल्पता आम है। आयरन युक्त भोजन मदद करता है।',
      kn: 'ಮಹಿಳೆಯರಲ್ಲಿ ರಕ್ತಹೀನತೆ ಸಾಮಾನ್ಯ. ಕಬ್ಬಿಣ ಯುಕ್ತ ಆಹಾರ ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
    },
    body: [
      {
        en: 'Signs include feeling tired, weak, pale, or breathless on small effort.',
        hi: 'लक्षणों में थकान, कमज़ोरी, पीलापन, और थोड़ी मेहनत में साँस फूलना शामिल है।',
        kn: 'ಲಕ್ಷಣಗಳು: ಆಯಾಸ, ದೌರ್ಬಲ್ಯ, ಬಣ್ಣಬಿಳಿ, ಸ್ವಲ್ಪ ಕೆಲಸಕ್ಕೆ ಉಸಿರಾಟ ಬೆಗುವುದು.',
      },
      {
        en: 'Eat green leafy vegetables, beans, jaggery, and locally available iron-rich grains.',
        hi: 'हरी पत्तेदार सब्ज़ियाँ, फलियाँ, गुड़, और स्थानीय आयरन युक्त अनाज खाएँ।',
        kn: 'ಹಸಿರು ಎಲೆ ತರಕಾರಿ, ಬೇಳೆ, ಬೆಲ್ಲ, ಊರಿನ ಕಬ್ಬಿಣ ಯುಕ್ತ ಧಾನ್ಯ ತಿನ್ನುವಿರಿ.',
      },
      {
        en: 'Vitamin C (lemon, amla) helps absorb iron. Tea right after meals reduces it.',
        hi: 'विटामिन सी (नींबू, आँवला) आयरन सोखने में मदद करता है। खाने के तुरंत बाद चाय इसे घटाती है।',
        kn: 'ವಿಟಮಿನ್ ಸಿ (ನಿಂಬೆ, ಆವಳೆ) ಕಬ್ಬಿಣ ಹೀರಲು ಸಹಾಯ. ಊಟದ ನಂತರದ ಚಹಾ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.',
      },
    ],
    source: 'India NHM anaemia prevention (POSHAN)',
    nextStep: {
      label: { en: 'Read nutrition lessons', hi: 'पोषण पाठ पढ़ें', kn: 'ಪೋಷಣೆ ಪಾಠ ದಿ' },
      to: '/awareness',
    },
  },
  {
    id: 'breast-health',
    category: 'prevention',
    icon: 'Ribbon',
    title: { en: 'Know your breasts', hi: 'अपने स्तन जानें', kn: 'ನಿಮ್ಮ ಸ್ತನಗಳನ್ನು ತಿಳಿಯಿರಿ' },
    summary: {
      en: 'Being familiar with your body helps you notice changes early.',
      hi: 'अपने शरीर से परिचित रहना बदलाव जल्दी पहचानने में मदद करता है।',
      kn: 'ನಿಮ್ಮ ದೇಹವನ್ನು ತಿಳಿದಿರುವುದು ಬದಲಾವಣೆಗಳನ್ನು ಬೇಗ ಗುರುತಿಸಲು ಸಹಾಯ.',
    },
    body: [
      {
        en: 'Notice any new lump, skin change, or fluid from the breast and get it checked.',
        hi: 'कोई नई गाँठ, त्वचा में बदलाव, या स्तन से रिसाव दिखे तो जाँच कराएँ।',
        kn: 'ಹೊಸ ಗಂಟು, ಚರ್ಮದ ಬದಲಾವಣೆ, ಅಥವಾ ಸ್ತನದಿಂದ ಸ್ರವಿಸುವಿಕೆ ಕಂಡರೆ ಪರೀಕ್ಷಿಸಿ.',
      },
      {
        en: 'Most changes are not cancer, but only a health worker can tell for sure.',
        hi: 'ज़्यादातर बदलाव कैंसर नहीं होते, पर निश्चित रूप केवल स्वास्थ्य कार्यकर्ता ही बता सकते हैं।',
        kn: 'ಹೆಚ್ಚಿನ ಬದಲಾವಣೆಗಳು ಕ್ಯಾನ್ಸರ್ ಅಲ್ಲ, ಆದರೆ ಖಚಿತವಾಗಿ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರೇ ಹೇಳಬಹುದು.',
      },
    ],
    seekHelp: {
      en: 'See a doctor for any lump that stays, or bleeding from the nipple.',
      hi: 'टिकाऊ गाँठ या निपल से रक्तस्राव के लिए डॉक्टर से मिलें।',
      kn: 'ನಿಲ್ಲುವ ಗಂಟು ಅಥವಾ ನಿಪಲ್‌ನಿಂದ ರಕ್ತಸ್ರಾವಕ್ಕೆ ವೈದ್ಯರನ್ನು ಭೇಟಿ ಮಾಡಿ.',
    },
    source: 'WHO breast awareness guidance',
    nextStep: {
      label: { en: 'Find a doctor', hi: 'डॉक्टर खोजें', kn: 'ವೈದ್ಯರನ್ನು ಹುಡುಕಿ' },
      to: '/find-doctor',
    },
  },
  {
    id: 'cervical-screening',
    category: 'prevention',
    icon: 'ShieldPlus',
    title: { en: 'Cervical screening', hi: 'गर्भाशय ग्रीवा जाँच', kn: 'ಸರ್ವಿಕಲ್ ಪರೀಕ್ಷೆ' },
    summary: {
      en: 'Simple screening can find problems before they become serious.',
      hi: 'सरल जाँच गंभीर बनने से पहले समस्या पा सकती है।',
      kn: 'ಸರಳ ಪರೀಕ್ಷೆ ಗಂಭೀರ ಆಗುವ ಮೊದಲೇ ಸಮಸ್ಯೆ ಕಂಡುಹಿಡಿಯಬಹುದು.',
    },
    body: [
      {
        en: 'Talk to a health worker about screening available at your district hospital.',
        hi: 'अपने ज़िला अस्पताल में उपलब्ध जाँच के बारे में स्वास्थ्य कार्यकर्ता से बात करें।',
        kn: 'ನಿಮ್ಮ ಜಿಲ್ಲಾ ಆಸ್ಪತ್ರೆಯಲ್ಲಿ ಲಭ್ಯ ಪರೀಕ್ಷೆ ಬಗ್ಗೆ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರೊಂದಿಗೆ ಮಾತನಾಡಿ.',
      },
      {
        en: 'HPV vaccination, where available, helps prevent cervical cancer.',
        hi: 'जहाँ उपलब्ध हो, HPV टीका गर्भाशय ग्रीवा कैंसर रोकने में मदद करता है।',
        kn: 'ಲಭ್ಯವಿದ್ದಲ್ಲಿ, HPV ಲಸಿಕೆ ಸರ್ವಿಕಲ್ ಕ್ಯಾನ್ಸರ್ ತಡೆಯಲು ಸಹಾಯ.',
      },
    ],
    source: 'WHO cervical cancer screening',
  },
  {
    id: 'mental-health',
    category: 'wellness',
    icon: 'Heart',
    title: { en: 'Your feelings matter', hi: 'आपकी भावनाएँ ज़रूरी हैं', kn: 'ನಿಮ್ಮ ಅನುಭವಗಳು ಮುಖ್ಯ' },
    summary: {
      en: 'Feeling low or stressed is human. Support exists.',
      hi: 'उदास या तनाव महसूस करना स्वाभाविक है। सहायता उपलब्ध है।',
      kn: 'ಕೆಳಗಿನ ಅನುಭವ ಒತ್ತಡ ಸಹಜ. ಸಹಾಯ ಲಭ್ಯವಿದೆ.',
    },
    body: [
      {
        en: 'Talk to someone you trust. Even a short walk and steady breathing can ease stress.',
        hi: 'किसी भरोसेमंद से बात करें। थोड़ी सैर और स्थिर साँसें भी तनाव कम कर सकती हैं।',
        kn: 'ನಂಬಿಕೆಯವರೊಂದಿಗೆ ಮಾತನಾಡಿ. ಸ್ವಲ್ಪ ನಡಿಗೆ ಮತ್ತು ಸ್ಥಿರ ಉಸಿರಾಟ ಒತ್ತಡ ಕಡಿಮೆ ಮಾಡಬಹುದು.',
      },
      {
        en: 'If sadness stays for weeks or you think of harming yourself, reach out for help now.',
        hi: 'अगर उदासी हफ्तों तक रहे या खुद को नुकसान का विचार आए, तो अभी सहायता लें।',
        kn: 'ಕೆವಳ ವಾರಗಳಷ್ಟು ಇದ್ದರೆ ಅಥವಾ ತನ್ನಿಗೆ ಹಾನಿ ಮಾಡಿಕೊಳ್ಳುವ ಯೋಚನೆ ಬಂದರೆ, ಈಗ ಸಹಾಯ ಪಡೆಯಿರಿ.',
      },
    ],
    seekHelp: {
      en: 'You can call the Women Helpline (181) for support and guidance.',
      hi: 'सहायता और मार्गदर्शन के लिए महिला हेल्पलाइन (181) पर कॉल कर सकते हैं।',
      kn: 'ಬೆಂಬಲ ಮತ್ತು ಮಾರ್ಗದರ್ಶನಕ್ಕಾಗಿ ಮಹಿಳಾ ಹೆಲ್ಪ್‌ಲೈನ್ (181) ಕರೆ ಮಾಡಿ.',
    },
    source: 'India Tele-MANAS / NHM mental health',
    nextStep: {
      label: { en: 'Open safety & support', hi: 'सुरक्षा और सहायता खोलें', kn: 'ಸುರಕ್ಷತೆ ಮತ್ತು ಬೆಂಬಲ ತೆರೆಯಿರಿ' },
      to: '/safety',
    },
  },
  {
    id: 'hydration',
    category: 'wellness',
    icon: 'GlassWater',
    title: { en: 'Drink enough water', hi: 'पर्याप्त पानी पिएँ', kn: 'ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ' },
    summary: {
      en: 'Clean water keeps energy up and prevents illness.',
      hi: 'साफ़ पानी ऊर्जा बनाए रखता है और बीमारी रोकता है।',
      kn: 'ಶುಚಿ ನೀರು ಶಕ್ತಿ ಇಡುತ್ತದೆ ಮತ್ತು ಕಾಯಿಲೆ ತಡೆಯುತ್ತದೆ.',
    },
    body: [
      {
        en: 'Aim for about 8 to 10 glasses a day, more in heat or while nursing.',
        hi: 'दिन में लगभग 8 से 10 गिलास, गर्मी या स्तनपान में अधिक लें।',
        kn: 'ದಿನಕ್ಕೆ ಸುಮಾರು 8 ರಿಂದ 10 ಗ್ಲಾಸ್, ಬೇಸಿಗೆಯಲ್ಲಿ ಅಥವಾ ಎಬ್ಬಿಸುವಾಗ ಹೆಚ್ಚು.',
      },
      {
        en: 'Dark urine, headache and dizziness can mean you need more water.',
        hi: 'गहरा पेशाब, सिरदर्द और चक्कर पानी की कमी बता सकते हैं।',
        kn: 'ಗಾಢ ಮೂತ್ರ, ತಲೆನೋವು ಮತ್ತು ತಲೆತಿರುಗುವಿಕೆ ನೀರಿನ ಕೊರತೆ ತೋರಿಸಬಹುದು.',
      },
    ],
    seekHelp: {
      en: 'Vomiting that stops you drinking, or confusion, needs urgent care.',
      hi: 'उल्टी से पानी न पी पाएँ या भ्रम हो, तो तुरंत देखभाल ज़रूरी है।',
      kn: 'ವಾಂತಿಯಿಂದ ನೀರು ಕುಡಿಯಲಾಗದರೆ ಅಥವಾ ಗೊಂದಲವಾದರೆ ತಕ್ಷಣ ಆರೈಕೆ ಬೇಕು.',
    },
    source: 'WHO oral rehydration guidance',
  },
  {
    id: 'myth-period',
    category: 'myths',
    icon: 'Ban',
    title: { en: 'Myth: periods are "unclean"', hi: 'भ्रांति: मासिक धर्म "अपवित्र" है', kn: 'ಸುಳ್ಳುನಂಬಿಕೆ: ಮಾಸಿಕ "ಅಶುಚಿ"' },
    summary: {
      en: 'Period blood is normal body tissue, not dirt or poison.',
      hi: 'मासिक रक्त सामान्य शारीरिक ऊतक है, गंदगी या ज़हर नहीं।',
      kn: 'ಮಾಸಿಕ ರಕ್ತ ಸಾಮಾನ್ಯ ದೇಹದ ಅಂಗಾಂಶ, ಕೊಳೆ ಅಥವಾ ವಿಷ ಅಲ್ಲ.',
    },
    body: [
      {
        en: 'A woman can cook, pray, and touch others during her period. Isolation is not needed.',
        hi: 'मासिक धर्म में महिला खाना पका सकती है, प्रार्थना कर सकती है, दूसरों को छू सकती है। अलग थूपना ज़रूरी नहीं।',
        kn: 'ಮಾಸಿಕದಲ್ಲಿ ಮಹಿಳೆ ಅಡುಗೆ ಮಾಡಬಹುದು, ಪ್ರಾರ್ಥಿಸಬಹುದು, ಇತರರನ್ನು ಮುಟ್ಟಬಹುದು. ಬೇರ್ಪಡಿಸುವುದು ಅಗತ್ಯವಿಲ್ಲ.',
      },
      {
        en: 'Bathing and washing hair during a period is safe and healthy.',
        hi: 'मासिक धर्म में स्नान और बाल धोना सुरक्षित और स्वस्थ है।',
        kn: 'ಮಾಸಿಕದಲ್ಲಿ ಸ್ನಾನ ಮತ್ತು ಕೂದಲು ತೊಳೆಯುವುದು ಸುರಕ್ಷಿತ ಮತ್ತು ಆರೋಗ್ಯಕರ.',
      },
    ],
    source: 'Reviewed against WHO menstrual health facts',
  },
  {
    id: 'myth-fertility',
    category: 'myths',
    icon: 'Ban',
    title: { en: 'Myth: only women cause infertility', hi: 'भ्रांति: केवल महिला बाँझपन का कारण', kn: 'ಸುಳ್ಳುನಂಬಿಕೆ: ಸಂತಾನಹೀನತೆ ಮಹಿಳೆಯಿಂದ ಮಾತ್ರ' },
    summary: {
      en: 'Difficulty having a child can involve either partner.',
      hi: 'संतान में कठिनाई किसी भी साथी से जुड़ी हो सकती है।',
      kn: 'ಮಕ್ಕಳ ಸಮಸ್ಯೆ ಯಾವ ಜೋಡಿಯಿಂದಲೂ ಇರಬಹುದು.',
    },
    body: [
      {
        en: 'Both men and women should be checked. It is not a woman\'s "fault".',
        hi: 'पुरुष और महिला दोनों की जाँच होनी चाहिए। यह महिला की "गलती" नहीं।',
        kn: 'ಪುರುಷ ಮತ್ತು ಮಹಿಳೆ ಇಬ್ಬರ ಪರೀಕ್ಷೆ ಆಗಬೇಕು. ಇದು ಮಹಿಳೆಯ "ತಪ್ಪು" ಅಲ್ಲ.',
      },
      {
        en: 'A qualified doctor can guide safe, evidence-based options.',
        hi: 'योग्य डॉक्टर सुरक्षित, प्रमाण-आधारित विकल्प बता सकते हैं।',
        kn: 'ಅರ್ಹ ವೈದ್ಯರು ಸುರಕ್ಷಿತ, ಪುರಾವೆ ಆಧಾರಿತ ಆಯ್ಕೆಗಳು ಹೇಳಬಹುದು.',
      },
    ],
    source: 'Reviewed reproductive-health guidance',
  },
];

export const awarenessCategories: { id: AwarenessCategory; icon: string }[] = [
  { id: 'lifecycle', icon: 'Flower2' },
  { id: 'prevention', icon: 'ShieldPlus' },
  { id: 'wellness', icon: 'Sparkles' },
  { id: 'myths', icon: 'HelpCircle' },
];

export function articlesByCategory(category: AwarenessCategory): AwarenessArticle[] {
  return awarenessArticles.filter((a) => a.category === category);
}
