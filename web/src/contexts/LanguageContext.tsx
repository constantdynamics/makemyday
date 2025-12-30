import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'nl' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Get initial language from localStorage or default to Dutch
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'nl' || saved === 'en') ? saved : 'nl';
  });

  // Save language preference to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translations
const translations = {
  nl: {
    common: {
      loading: 'Laden...',
      error: 'Er is iets misgegaan',
      back: 'Terug',
      next: 'Volgende',
      save: 'Opslaan',
      cancel: 'Annuleren',
      confirm: 'Bevestigen',
      delete: 'Verwijderen',
      edit: 'Bewerken',
      close: 'Sluiten',
    },
    welcome: {
      title: 'Make My Day',
      subtitle: 'Jouw persoonlijke avonturencompagnon',
      description: 'Ontdek unieke activiteiten bij jou in de buurt, draai aan het rad en maak elke dag bijzonder',
      getStarted: 'Aan de slag',
      login: 'Inloggen',
      tryGuest: 'Probeer zonder account',
      features: {
        discover: {
          title: 'Ontdek Activiteiten',
          description: 'Vind unieke dingen om te doen bij jou in de buurt',
        },
        spin: {
          title: 'Draai & Doe',
          description: 'Laat het rad beslissen wat je vandaag gaat doen',
        },
        track: {
          title: 'Bijhouden',
          description: 'Hou je avonturen bij en verzamel herinneringen',
        },
        community: {
          title: 'Deel & Inspireer',
          description: 'Deel je ervaringen en laat je inspireren door anderen',
        },
      },
    },
    auth: {
      login: {
        title: 'Welkom terug',
        subtitle: 'Log in om je avonturen voort te zetten',
        email: 'E-mailadres',
        password: 'Wachtwoord',
        forgotPassword: 'Wachtwoord vergeten?',
        loginButton: 'Inloggen',
        noAccount: 'Nog geen account?',
        signUp: 'Aanmelden',
      },
      register: {
        title: 'Begin je avontuur',
        subtitle: 'Maak een account aan en ontdek nieuwe mogelijkheden',
        name: 'Volledige naam',
        email: 'E-mailadres',
        password: 'Wachtwoord',
        confirmPassword: 'Bevestig wachtwoord',
        registerButton: 'Account aanmaken',
        haveAccount: 'Al een account?',
        signIn: 'Inloggen',
        terms: 'Door je aan te melden ga je akkoord met onze',
        termsLink: 'Algemene Voorwaarden',
        and: 'en',
        privacyLink: 'Privacybeleid',
      },
    },
    dashboard: {
      title: 'Dashboard',
      greeting: 'Hallo',
      subtitle: 'Klaar voor een nieuw avontuur?',
      spinWheel: 'Draai het Rad',
      spinButton: 'Draai voor een activiteit',
      stats: {
        completed: 'Voltooid',
        activities: 'activiteiten',
        streak: 'Reeks',
        days: 'dagen',
        points: 'Punten',
        earned: 'verdiend',
        level: 'Level',
        adventurer: 'Avonturier',
      },
      quickActions: {
        title: 'Snelle acties',
        explore: 'Verken',
        challenges: 'Uitdagingen',
        premium: 'Premium',
      },
      recentActivities: {
        title: 'Recente Activiteiten',
        viewAll: 'Bekijk alles',
      },
      nav: {
        home: 'Home',
        explore: 'Verken',
        community: 'Community',
        profile: 'Profiel',
      },
    },
    premium: {
      title: 'Upgrade naar Premium',
      subtitle: 'Ontgrendel alle functies en maak het meeste van elke dag',
      monthly: 'Maandelijks',
      yearly: 'Jaarlijks',
      monthlyPrice: '€1,50',
      yearlyPrice: '€12',
      perMonth: '/maand',
      perYear: '/jaar',
      save: 'Bespaar 33%',
      startTrial: 'Start 7 Dagen Gratis Proefperiode',
      choosePlan: 'Kies dit abonnement',
      features: {
        title: 'Alles in Premium',
        unlimited: 'Onbeperkte spins',
        themed: 'Thematische avonturen',
        advanced: 'Geavanceerde statistieken',
        priority: 'Prioriteitsondersteuning',
        offline: 'Offline modus',
        custom: 'Aangepaste uitdagingen',
      },
      compare: {
        title: 'Vergelijk Abonnementen',
        feature: 'Functie',
        free: 'Gratis',
        premium: 'Premium',
        dailySpins: 'Dagelijkse spins',
        spinsLimit: '3 per dag',
        spinsUnlimited: 'Onbeperkt',
        activities: 'Activiteiten database',
        activitiesBasic: 'Basis',
        activitiesFull: 'Volledig',
        offline: 'Offline modus',
        support: 'Ondersteuning',
        supportCommunity: 'Community',
        supportPriority: 'Prioriteit',
      },
      testimonials: {
        title: 'Wat gebruikers zeggen',
        sarah: {
          text: 'Make My Day heeft mijn weekenden getransformeerd! Ik ontdek elke week nieuwe plekken.',
          author: 'Sarah M.',
        },
        john: {
          text: 'De premium functies zijn het absoluut waard. Thematische avonturen zijn geweldig!',
          author: 'John D.',
        },
        emma: {
          text: 'Eindelijk een app die mij helpt uit mijn comfortzone te stappen. Zeer aan te raden!',
          author: 'Emma K.',
        },
      },
      guarantee: 'Niet tevreden? Geld-terug-garantie binnen 30 dagen.',
    },
    community: {
      title: 'Community',
      subtitle: 'Ontdek wat anderen beleven',
      recent: 'Recent',
      trending: 'Trending',
      following: 'Volgend',
      writePost: 'Deel je avontuur...',
      like: 'Vind ik leuk',
      comment: 'Reageer',
      share: 'Deel',
      likes: 'vind-ik-leuks',
      comments: 'reacties',
    },
    settings: {
      title: 'Instellingen',
      subtitle: 'Personaliseer je ervaring',
      language: {
        title: 'Taal',
        description: 'Kies je voorkeurstaal',
        dutch: 'Nederlands',
        english: 'Engels',
      },
      account: {
        title: 'Account',
        profile: 'Profielbeheer',
        email: 'E-mailinstellingen',
        password: 'Wachtwoord wijzigen',
        privacy: 'Privacy instellingen',
      },
      preferences: {
        title: 'Voorkeuren',
        notifications: 'Notificaties',
        theme: 'Thema',
        location: 'Locatie',
      },
      about: {
        title: 'Over',
        version: 'Versie',
        terms: 'Algemene Voorwaarden',
        privacy: 'Privacybeleid',
        help: 'Hulp & Support',
      },
      logout: 'Uitloggen',
    },
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Something went wrong',
      back: 'Back',
      next: 'Next',
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'Confirm',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
    },
    welcome: {
      title: 'Make My Day',
      subtitle: 'Your Personal Adventure Companion',
      description: 'Discover unique activities near you, spin the wheel, and make every day special',
      getStarted: 'Get Started',
      login: 'Login',
      tryGuest: 'Try without account',
      features: {
        discover: {
          title: 'Discover Activities',
          description: 'Find unique things to do near you',
        },
        spin: {
          title: 'Spin & Do',
          description: 'Let the wheel decide your next adventure',
        },
        track: {
          title: 'Track Progress',
          description: 'Keep track of your adventures and collect memories',
        },
        community: {
          title: 'Share & Inspire',
          description: 'Share your experiences and get inspired by others',
        },
      },
    },
    auth: {
      login: {
        title: 'Welcome Back',
        subtitle: 'Log in to continue your adventures',
        email: 'Email Address',
        password: 'Password',
        forgotPassword: 'Forgot Password?',
        loginButton: 'Log In',
        noAccount: "Don't have an account?",
        signUp: 'Sign Up',
      },
      register: {
        title: 'Start Your Adventure',
        subtitle: 'Create an account and discover new possibilities',
        name: 'Full Name',
        email: 'Email Address',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        registerButton: 'Create Account',
        haveAccount: 'Already have an account?',
        signIn: 'Sign In',
        terms: 'By signing up you agree to our',
        termsLink: 'Terms of Service',
        and: 'and',
        privacyLink: 'Privacy Policy',
      },
    },
    dashboard: {
      title: 'Dashboard',
      greeting: 'Hello',
      subtitle: 'Ready for a new adventure?',
      spinWheel: 'Spin the Wheel',
      spinButton: 'Spin for Activity',
      stats: {
        completed: 'Completed',
        activities: 'activities',
        streak: 'Streak',
        days: 'days',
        points: 'Points',
        earned: 'earned',
        level: 'Level',
        adventurer: 'Adventurer',
      },
      quickActions: {
        title: 'Quick Actions',
        explore: 'Explore',
        challenges: 'Challenges',
        premium: 'Premium',
      },
      recentActivities: {
        title: 'Recent Activities',
        viewAll: 'View All',
      },
      nav: {
        home: 'Home',
        explore: 'Explore',
        community: 'Community',
        profile: 'Profile',
      },
    },
    premium: {
      title: 'Upgrade to Premium',
      subtitle: 'Unlock all features and make the most of every day',
      monthly: 'Monthly',
      yearly: 'Yearly',
      monthlyPrice: '€1.50',
      yearlyPrice: '€12',
      perMonth: '/month',
      perYear: '/year',
      save: 'Save 33%',
      startTrial: 'Start 7-Day Free Trial',
      choosePlan: 'Choose Plan',
      features: {
        title: 'Everything in Premium',
        unlimited: 'Unlimited spins',
        themed: 'Themed adventures',
        advanced: 'Advanced analytics',
        priority: 'Priority support',
        offline: 'Offline mode',
        custom: 'Custom challenges',
      },
      compare: {
        title: 'Compare Plans',
        feature: 'Feature',
        free: 'Free',
        premium: 'Premium',
        dailySpins: 'Daily spins',
        spinsLimit: '3 per day',
        spinsUnlimited: 'Unlimited',
        activities: 'Activities database',
        activitiesBasic: 'Basic',
        activitiesFull: 'Full',
        offline: 'Offline mode',
        support: 'Support',
        supportCommunity: 'Community',
        supportPriority: 'Priority',
      },
      testimonials: {
        title: 'What Users Say',
        sarah: {
          text: 'Make My Day has transformed my weekends! I discover new places every week.',
          author: 'Sarah M.',
        },
        john: {
          text: 'The premium features are absolutely worth it. Themed adventures are amazing!',
          author: 'John D.',
        },
        emma: {
          text: 'Finally an app that helps me step out of my comfort zone. Highly recommended!',
          author: 'Emma K.',
        },
      },
      guarantee: 'Not satisfied? 30-day money-back guarantee.',
    },
    community: {
      title: 'Community',
      subtitle: 'Discover what others are experiencing',
      recent: 'Recent',
      trending: 'Trending',
      following: 'Following',
      writePost: 'Share your adventure...',
      like: 'Like',
      comment: 'Comment',
      share: 'Share',
      likes: 'likes',
      comments: 'comments',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Personalize your experience',
      language: {
        title: 'Language',
        description: 'Choose your preferred language',
        dutch: 'Dutch',
        english: 'English',
      },
      account: {
        title: 'Account',
        profile: 'Profile Management',
        email: 'Email Settings',
        password: 'Change Password',
        privacy: 'Privacy Settings',
      },
      preferences: {
        title: 'Preferences',
        notifications: 'Notifications',
        theme: 'Theme',
        location: 'Location',
      },
      about: {
        title: 'About',
        version: 'Version',
        terms: 'Terms of Service',
        privacy: 'Privacy Policy',
        help: 'Help & Support',
      },
      logout: 'Log Out',
    },
  },
};
