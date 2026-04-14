import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "explore": "Explore",
      "how_it_works": "How it Works",
      "about": "About",
      "login": "Login",
      "post_need": "Post a Need",
      "hero_title": "Find the Perfect Artisan for Your Home",
      "hero_subtitle": "Sri Lanka's most trusted platform for verified local services and traditional craftsmanship.",
      "search_placeholder": "What service do you need?",
      "location_placeholder": "Location (e.g. Colombo)",
      "search": "Search",
      "post_directly": "Or post a need directly",
      "switch_worker": "Switch to Worker View"
    }
  },
  si: {
    translation: {
      "explore": "ගවේෂණය කරන්න",
      "how_it_works": "එය ක්‍රියා කරන ආකාරය",
      "about": "අප ගැන",
      "login": "ඇතුල් වන්න",
      "post_need": "අවශ්‍යතාවයක් පළ කරන්න",
      "hero_title": "ඔබේ නිවස සඳහා සුදුසුම ශිල්පියා සොයා ගන්න",
      "hero_subtitle": "සත්‍යාපිත දේශීය සේවා සහ සාම්ප්‍රදායික ශිල්පීය හැකියාවන් සඳහා ශ්‍රී ලංකාවේ වඩාත්ම විශ්වාසදායක වේදිකාව.",
      "search_placeholder": "ඔබට අවශ්‍ය සේවාව කුමක්ද?",
      "location_placeholder": "ස්ථානය (උදා: කොළඹ)",
      "search": "සොයන්න",
      "post_directly": "නැතහොත් කෙලින්ම අවශ්‍යතාවයක් පළ කරන්න",
      "switch_worker": "සේවක දර්ශනයට මාරු වන්න"
    }
  },
  ta: {
    translation: {
      "explore": "ஆராயுங்கள்",
      "how_it_works": "இது எப்படி வேலை செய்கிறது",
      "about": "எங்களை பற்றி",
      "login": "உள்நுழை",
      "post_need": "தேவையை இடுகையிடவும்",
      "hero_title": "உங்கள் வீட்டிற்கு சரியான கலைஞரைக் கண்டறியவும்",
      "hero_subtitle": "சரிபார்க்கப்பட்ட உள்ளூர் சேவைகள் மற்றும் பாரம்பரிய கைவினைத்திறனுக்கான இலங்கையின் மிகவும் நம்பகமான தளம்.",
      "search_placeholder": "உங்களுக்கு என்ன சேவை தேவை?",
      "location_placeholder": "இடம் (எ.கா. கொழும்பு)",
      "search": "தேடு",
      "post_directly": "அல்லது நேரடியாக ஒரு தேவையை இடுகையிடவும்",
      "switch_worker": "வேலையாள் பார்வைக்கு மாறவும்"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
