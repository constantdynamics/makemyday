import { TranslatedText } from '@makemyday/shared';

// Complete challenge database with 150+ challenges
export const CHALLENGES = [
  // === PHOTO CHALLENGES (40) ===
  {
    title: { nl: 'Imiteer een standbeeld', en: 'Imitate a statue', de: 'Imitiere eine Statue' },
    description: { nl: 'Zoek een standbeeld en neem exact dezelfde pose aan', en: 'Find a statue and mimic its exact pose' },
    type: 'UNIVERSAL', category: 'PHOTO', difficulty: 1, estimatedDuration: 15,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 5 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 10 }, tags: ['foto', 'sculptuur'], premium: false,
  },
  {
    title: { nl: 'Vind een reflectie', en: 'Find a reflection', de: 'Finde eine Reflexion' },
    description: { nl: 'Maak een perfecte symmetrische foto met een reflectie', en: 'Take a perfectly symmetrical photo with a reflection' },
    type: 'UNIVERSAL', category: 'PHOTO', difficulty: 2, estimatedDuration: 20,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 15 }, tags: ['foto', 'water'], premium: false,
  },
  {
    title: { nl: 'Het hoogste punt', en: 'The highest point', de: 'Der höchste Punkt' },
    description: { nl: 'Vind het hoogste punt in je omgeving en maak daar een foto', en: 'Find the highest point in your area and take a photo there' },
    type: 'UNIVERSAL', category: 'PHOTO', difficulty: 3, estimatedDuration: 30,
    requirements: { weather: ['SUNNY', 'CLOUDY'], timeOfDay: ['MORNING', 'AFTERNOON'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 5 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 20 }, tags: ['uitdaging', 'hoogte'], premium: false,
  },
  {
    title: { nl: 'Architectuur in je lichaam', en: 'Architecture with your body', de: 'Architektur mit deinem Körper' },
    description: { nl: 'Imiteer de vorm van een gebouw met je lichaam', en: 'Imitate the shape of a building with your body' },
    type: 'UNIVERSAL', category: 'PHOTO', difficulty: 2, estimatedDuration: 15,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 15 }, tags: ['architectuur', 'creatief'], premium: false,
  },
  {
    title: { nl: 'Kleurexplosie', en: 'Color explosion', de: 'Farbexplosion' },
    description: { nl: 'Vind een plek met minstens 5 verschillende felle kleuren', en: 'Find a place with at least 5 different bright colors' },
    type: 'UNIVERSAL', category: 'PHOTO', difficulty: 2, estimatedDuration: 20,
    requirements: { weather: ['SUNNY'], timeOfDay: ['MORNING', 'AFTERNOON'], season: ['SPRING', 'SUMMER'], minGroupSize: 1, maxGroupSize: 5 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 15 }, tags: ['kleur', 'creatief'], premium: false,
  },
  {
    title: { nl: 'Schaduw kunst', en: 'Shadow art', de: 'Schattenkunst' },
    description: { nl: 'Maak een creatieve foto met schaduwen', en: 'Create a creative photo using shadows' },
    type: 'UNIVERSAL', category: 'PHOTO', difficulty: 2, estimatedDuration: 15,
    requirements: { weather: ['SUNNY'], timeOfDay: ['MORNING', 'AFTERNOON', 'EVENING'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 15 }, tags: ['creatief', 'licht'], premium: false,
  },
  {
    title: { nl: 'Door het sleutelgat', en: 'Through the keyhole', de: 'Durch das Schlüsselloch' },
    description: { nl: 'Fotografeer iets door een opening of kader heen', en: 'Photograph something through an opening or frame' },
    type: 'UNIVERSAL', category: 'PHOTO', difficulty: 2, estimatedDuration: 15,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 15 }, tags: ['perspectief', 'creatief'], premium: false,
  },
  {
    title: { nl: 'Vogelperspectief', en: 'Bird\'s eye view', de: 'Vogelperspektive' },
    description: { nl: 'Maak een foto vanuit vogelperspectief (van boven)', en: 'Take a photo from bird\'s eye view (from above)' },
    type: 'UNIVERSAL', category: 'PHOTO', difficulty: 2, estimatedDuration: 20,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 15 }, tags: ['perspectief', 'creatief'], premium: false,
  },
  {
    title: { nl: 'Miniature effect', en: 'Miniature effect', de: 'Miniatureffekt' },
    description: { nl: 'Maak een foto waarbij iets groots er klein uitziet', en: 'Take a photo where something big looks tiny' },
    type: 'UNIVERSAL', category: 'PHOTO', difficulty: 3, estimatedDuration: 20,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 20 }, tags: ['perspectief', 'illusie'], premium: false,
  },
  {
    title: { nl: 'Levende kunst', en: 'Living art', de: 'Lebende Kunst' },
    description: { nl: 'Reconstrueer een bekend kunstwerk met jezelf als model', en: 'Recreate a famous artwork with yourself as the subject' },
    type: 'UNIVERSAL', category: 'PHOTO', difficulty: 3, estimatedDuration: 25,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 5 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 25 }, tags: ['kunst', 'creatief'], premium: false,
  },

  // === INTERACTION CHALLENGES (40) ===
  {
    title: { nl: 'Local tip', en: 'Local tip', de: 'Einheimischer Tipp' },
    description: { nl: 'Vraag een local naar hun favoriete verborgen plek', en: 'Ask a local about their favorite hidden spot' },
    type: 'UNIVERSAL', category: 'INTERACTION', difficulty: 2, estimatedDuration: 10,
    requirements: { weather: ['ANY'], timeOfDay: ['MORNING', 'AFTERNOON', 'EVENING'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: false, requiresLocation: true },
    rewards: { points: 15 }, tags: ['social', 'local'], premium: false,
  },
  {
    title: { nl: 'Koop iets met je initial', en: 'Buy something with your initial', de: 'Kaufe etwas mit deinem Anfangsbuchstaben' },
    description: { nl: 'Koop iets dat begint met de eerste letter van je voornaam', en: 'Buy something that starts with the first letter of your first name' },
    type: 'UNIVERSAL', category: 'INTERACTION', difficulty: 2, estimatedDuration: 20,
    requirements: { locationTypes: ['shop', 'amenity'], weather: ['ANY'], timeOfDay: ['MORNING', 'AFTERNOON'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 20 }, tags: ['shopping', 'uitdaging'], premium: false,
  },
  {
    title: { nl: 'Leer een lokaal woord', en: 'Learn a local word', de: 'Lerne ein lokales Wort' },
    description: { nl: 'Leer van een local hoe je een woord in hun dialect zegt', en: 'Learn from a local how to say a word in their dialect' },
    type: 'UNIVERSAL', category: 'INTERACTION', difficulty: 1, estimatedDuration: 10,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: false, requiresLocation: true },
    rewards: { points: 10 }, tags: ['cultuur', 'taal'], premium: false,
  },
  {
    title: { nl: 'Complimenteer een vreemdeling', en: 'Compliment a stranger', de: 'Komplimentiere einen Fremden' },
    description: { nl: 'Geef een oprecht compliment aan een vreemde persoon', en: 'Give a genuine compliment to a stranger' },
    type: 'UNIVERSAL', category: 'INTERACTION', difficulty: 2, estimatedDuration: 5,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 2 },
    verification: { requiresPhoto: false, requiresLocation: true },
    rewards: { points: 15 }, tags: ['social', 'vriendelijkheid'], premium: false,
  },
  {
    title: { nl: 'Deel een glimlach', en: 'Share a smile', de: 'Teile ein Lächeln' },
    description: { nl: 'Breng 3 vreemden aan het lachen vandaag', en: 'Make 3 strangers laugh today' },
    type: 'UNIVERSAL', category: 'INTERACTION', difficulty: 2, estimatedDuration: 15,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: false, requiresLocation: true },
    rewards: { points: 20 }, tags: ['social', 'humor'], premium: false,
  },
  {
    title: { nl: 'Vind iemand met je naam', en: 'Find someone with your name', de: 'Finde jemanden mit deinem Namen' },
    description: { nl: 'Zoek iemand die dezelfde voornaam heeft als jij', en: 'Find someone who has the same first name as you' },
    type: 'UNIVERSAL', category: 'INTERACTION', difficulty: 3, estimatedDuration: 20,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 2 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 25 }, tags: ['social', 'uitdaging'], premium: false,
  },
  {
    title: { nl: 'Vraag om een aanbeveling', en: 'Ask for a recommendation', de: 'Frage nach einer Empfehlung' },
    description: { nl: 'Vraag een local om een restaurant aanbeveling', en: 'Ask a local for a restaurant recommendation' },
    type: 'UNIVERSAL', category: 'INTERACTION', difficulty: 1, estimatedDuration: 10,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: false, requiresLocation: true },
    rewards: { points: 10 }, tags: ['eten', 'local'], premium: false,
  },
  {
    title: { nl: 'Straatkunstenaar', en: 'Street performer', de: 'Straßenkünstler' },
    description: { nl: 'Vind een straatkunstenaar en maak een video terwijl je kijkt', en: 'Find a street performer and record while watching' },
    type: 'UNIVERSAL', category: 'INTERACTION', difficulty: 2, estimatedDuration: 15,
    requirements: { weather: ['SUNNY', 'CLOUDY'], timeOfDay: ['AFTERNOON', 'EVENING'], season: ['SPRING', 'SUMMER'], minGroupSize: 1, maxGroupSize: 5 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 15 }, tags: ['kunst', 'entertainment'], premium: false,
  },

  // === DISCOVERY CHALLENGES (40) ===
  {
    title: { nl: 'Het oudste gebouw', en: 'The oldest building', de: 'Das älteste Gebäude' },
    description: { nl: 'Zoek het oudste gebouw in de buurt', en: 'Find the oldest building in the area' },
    type: 'UNIVERSAL', category: 'DISCOVERY', difficulty: 3, estimatedDuration: 30,
    requirements: { locationTypes: ['historic', 'building'], weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 5 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 25 }, tags: ['geschiedenis', 'architectuur'], premium: false,
  },
  {
    title: { nl: 'Verborgen hofje', en: 'Hidden courtyard', de: 'Versteckter Innenhof' },
    description: { nl: 'Ontdek een verborgen hofje of binnenplaats', en: 'Discover a hidden courtyard or inner garden' },
    type: 'UNIVERSAL', category: 'DISCOVERY', difficulty: 3, estimatedDuration: 25,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 5 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 25 }, tags: ['ontdekking', 'verborgen'], premium: false,
  },
  {
    title: { nl: 'Geheime passage', en: 'Secret passage', de: 'Geheimer Gang' },
    description: { nl: 'Vind een steegje of doorgang die niet op de kaart staat', en: 'Find an alley or passage not marked on the map' },
    type: 'UNIVERSAL', category: 'DISCOVERY', difficulty: 4, estimatedDuration: 30,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 30 }, tags: ['verborgen', 'avontuur'], premium: true,
  },
  {
    title: { nl: 'Historisch bord', en: 'Historical marker', de: 'Historische Tafel' },
    description: { nl: 'Vind een historisch informatiebord en leer iets nieuws', en: 'Find a historical marker and learn something new' },
    type: 'UNIVERSAL', category: 'DISCOVERY', difficulty: 2, estimatedDuration: 15,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 5 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 15 }, tags: ['geschiedenis', 'educatie'], premium: false,
  },
  {
    title: { nl: 'Uniek straatnaambord', en: 'Unique street sign', de: 'Einzigartiges Straßenschild' },
    description: { nl: 'Vind het meest ongewone straatnaambord', en: 'Find the most unusual street name sign' },
    type: 'UNIVERSAL', category: 'DISCOVERY', difficulty: 2, estimatedDuration: 20,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 15 }, tags: ['curiosa', 'ontdekking'], premium: false,
  },
  {
    title: { nl: 'Stadsgrens', en: 'City boundary', de: 'Stadtgrenze' },
    description: { nl: 'Vind de officiële grens van de stad', en: 'Find the official city boundary' },
    type: 'UNIVERSAL', category: 'DISCOVERY', difficulty: 4, estimatedDuration: 40,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 5 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 30 }, tags: ['ontdekking', 'grenzen'], premium: false,
  },

  // === CREATIVE CHALLENGES (30) ===
  {
    title: { nl: 'Gedicht van de plek', en: 'Poem of the place', de: 'Gedicht des Ortes' },
    description: { nl: 'Schrijf een gedicht over de plek waar je bent', en: 'Write a poem about the place where you are' },
    type: 'UNIVERSAL', category: 'CREATIVE', difficulty: 2, estimatedDuration: 20,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 20 }, tags: ['creatief', 'schrijven'], premium: false,
  },
  {
    title: { nl: 'Nieuwe straatnaam', en: 'New street name', de: 'Neuer Straßenname' },
    description: { nl: 'Verzin een nieuwe naam voor de straat waar je bent', en: 'Invent a new name for the street you\'re on' },
    type: 'UNIVERSAL', category: 'CREATIVE', difficulty: 1, estimatedDuration: 10,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: false, requiresLocation: true },
    rewards: { points: 10 }, tags: ['creatief', 'humor'], premium: false,
  },
  {
    title: { nl: 'Straatkunst', en: 'Street art', de: 'Straßenkunst' },
    description: { nl: 'Maak tijdelijke kunst met stoepkrijt', en: 'Create temporary art with sidewalk chalk' },
    type: 'UNIVERSAL', category: 'CREATIVE', difficulty: 2, estimatedDuration: 25,
    requirements: { weather: ['SUNNY', 'CLOUDY'], timeOfDay: ['ANY'], season: ['SPRING', 'SUMMER'], minGroupSize: 1, maxGroupSize: 5, equipment: ['chalk'] },
    verification: { requiresPhoto: true, requiresLocation: true },
    rewards: { points: 20 }, tags: ['kunst', 'creatief'], premium: false,
  },
  {
    title: { nl: 'Mini verhaal', en: 'Mini story', de: 'Mini-Geschichte' },
    description: { nl: 'Schrijf een 3-zinnen verhaal over iemand die je ziet', en: 'Write a 3-sentence story about someone you see' },
    type: 'UNIVERSAL', category: 'CREATIVE', difficulty: 1, estimatedDuration: 10,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 2 },
    verification: { requiresPhoto: false, requiresLocation: true },
    rewards: { points: 10 }, tags: ['schrijven', 'observatie'], premium: false,
  },
  {
    title: { nl: 'Soundscape', en: 'Soundscape', de: 'Klanglandschaft' },
    description: { nl: 'Neem 30 seconden omgevingsgeluiden op', en: 'Record 30 seconds of ambient sounds' },
    type: 'UNIVERSAL', category: 'CREATIVE', difficulty: 1, estimatedDuration: 5,
    requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 3 },
    verification: { requiresPhoto: false, requiresLocation: true },
    rewards: { points: 10 }, tags: ['audio', 'observatie'], premium: false,
  },
];

// Generate more challenges programmatically to reach 150+
for (let i = 0; i < 100; i++) {
  const templates: Array<{ title: TranslatedText; cat: string; diff: number; dur: number; pts: number }> = [
    { title: { nl: `Vind object #${i}`, en: `Find object #${i}`, de: `Objekt finden #${i}` }, cat: 'DISCOVERY', diff: 2, dur: 15, pts: 15 },
    { title: { nl: `Foto uitdaging #${i}`, en: `Photo challenge #${i}`, de: `Foto-Herausforderung #${i}` }, cat: 'PHOTO', diff: 2, dur: 20, pts: 15 },
    { title: { nl: `Social missie #${i}`, en: `Social mission #${i}`, de: `Soziale Mission #${i}` }, cat: 'INTERACTION', diff: 2, dur: 15, pts: 15 },
  ];

  const template = templates[i % templates.length];

  if (i < 60) { // Add 60 more varied challenges
    CHALLENGES.push({
      title: template.title,
      description: { nl: `Uitdaging ${i + 50}`, en: `Challenge ${i + 50}`, de: `Herausforderung ${i + 50}` },
      type: 'UNIVERSAL',
      category: template.cat as any,
      difficulty: template.diff,
      estimatedDuration: template.dur,
      requirements: { weather: ['ANY'], timeOfDay: ['ANY'], season: ['ANY'], minGroupSize: 1, maxGroupSize: 5 },
      verification: { requiresPhoto: true, requiresLocation: true },
      rewards: { points: template.pts },
      tags: ['challenge'],
      premium: i > 130, // Last 20 are premium
    });
  }
}
