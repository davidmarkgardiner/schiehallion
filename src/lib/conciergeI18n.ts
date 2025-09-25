import { SupportedLanguage } from '@/types/concierge'

type TranslationKey =
  | 'welcome.greeting'
  | 'welcome.capabilities'
  | 'welcome.prompt'
  | 'input.placeholder'
  | 'quick.attractions'
  | 'quick.booking'
  | 'quick.dining'
  | 'attractions.intro'
  | 'attractions.detail'
  | 'attractions.link'
  | 'attractions.hours'
  | 'attractions.followUp'
  | 'attractions.noMatch'
  | 'booking.askDates'
  | 'booking.summary'
  | 'booking.roomLine'
  | 'booking.noAvailability'
  | 'booking.followUp'
  | 'booking.action'
  | 'restaurant.intro'
  | 'restaurant.noMatch'
  | 'restaurant.followUp'
  | 'restaurant.action'
  | 'restaurant.pairing'
  | 'restaurant.special'
  | 'general.fallback'
  | 'general.helpOptions'
  | 'language.english'
  | 'language.french'
  | 'language.german'
  | 'language.spanish'
  | 'language.gaelic'

const translations: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  en: {
    'welcome.greeting': 'Fàilte! I\'m the Schiehallion Hotel concierge.',
    'welcome.capabilities': 'Ask me about rooms, dining, whisky trails, or hidden Perthshire adventures.',
    'welcome.prompt': 'How may I tailor your stay?',
    'input.placeholder': 'Ask about availability, dining, or local adventures…',
    'quick.attractions': 'Plan my day',
    'quick.booking': 'Check room dates',
    'quick.dining': 'Menu help',
    'attractions.intro': 'Here are experiences that match what you\'re looking for:',
    'attractions.detail': '{name} · {distance} km • {duration} mins travel • Ideal for {highlights}',
    'attractions.link': 'Book or learn more',
    'attractions.hours': 'Open today: {hours}',
    'attractions.followUp': 'Would you like tips for transport or tickets?',
    'attractions.noMatch': 'I\'ll keep an ear out for that – meanwhile, may I suggest a curated Perthshire itinerary?',
    'booking.askDates': 'Tell me your check-in and check-out dates so I can confirm availability.',
    'booking.summary': 'I can host you from {checkIn} to {checkOut} for {nights} night(s). Here\'s what\'s open right now:',
    'booking.roomLine': '{room} · sleeps {guests} · from £{price} per night',
    'booking.noAvailability': 'Those dates are popular! I can explore alternative dates or pop you on the waitlist.',
    'booking.followUp': 'Ready to continue online? I\'ll take you straight to the booking form.',
    'booking.action': 'Start booking',
    'restaurant.intro': 'Here\'s what fits your dining preferences tonight:',
    'restaurant.noMatch': 'I\'ll brief the kitchen – could we adapt a dish or discuss chef\'s table options?',
    'restaurant.followUp': 'Shall I reserve a table or add notes for the team?',
    'restaurant.action': 'Reserve a table',
    'restaurant.pairing': 'Suggested pairing: {pairing}',
    'restaurant.special': 'Tonight\'s special: {special}',
    'general.fallback': 'I can help with bookings, dining, adventures, wellness, and travel plans.',
    'general.helpOptions': 'Try asking about whisky tours, e-bike hire, spa rituals, or hiking conditions.',
    'language.english': 'English',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.spanish': 'Español',
    'language.gaelic': 'Gàidhlig',
  },
  fr: {
    'welcome.greeting': 'Fàilte! Je suis le concierge de l\'hôtel Schiehallion.',
    'welcome.capabilities': 'Demandez-moi les chambres, la gastronomie, les routes du whisky ou les escapades cachées du Perthshire.',
    'welcome.prompt': 'Comment puis-je préparer votre séjour ?',
    'input.placeholder': 'Demandez la disponibilité, la restauration ou les activités locales…',
    'quick.attractions': 'Planifier ma journée',
    'quick.booking': 'Vérifier les dates',
    'quick.dining': 'Aide menu',
    'attractions.intro': 'Voici des expériences qui correspondent à vos envies :',
    'attractions.detail': '{name} · {distance} km • {duration} min de trajet • Idéal pour {highlights}',
    'attractions.link': 'Réserver ou en savoir plus',
    'attractions.hours': 'Ouvert aujourd\'hui : {hours}',
    'attractions.followUp': 'Souhaitez-vous des conseils pour le transport ou les billets ?',
    'attractions.noMatch': 'Je garde cela en tête – puis-je proposer un itinéraire du Perthshire sur mesure ?',
    'booking.askDates': 'Indiquez-moi vos dates d\'arrivée et de départ pour confirmer la disponibilité.',
    'booking.summary': 'Je peux vous accueillir du {checkIn} au {checkOut} pour {nights} nuit(s). Voici les chambres disponibles :',
    'booking.roomLine': '{room} · {guests} personnes · dès £{price} par nuit',
    'booking.noAvailability': 'Ces dates sont très demandées ! Je peux vérifier d\'autres dates ou une liste d\'attente.',
    'booking.followUp': 'Prêt à continuer en ligne ? Je vous dirige vers le formulaire.',
    'booking.action': 'Commencer la réservation',
    'restaurant.intro': 'Voici ce qui correspond à vos préférences culinaires ce soir :',
    'restaurant.noMatch': 'J\'informerai la cuisine – voulons-nous adapter un plat ou envisager la table du chef ?',
    'restaurant.followUp': 'Puis-je réserver une table ou ajouter une note pour l\'équipe ?',
    'restaurant.action': 'Réserver une table',
    'restaurant.pairing': 'Accord suggéré : {pairing}',
    'restaurant.special': 'Suggestion du soir : {special}',
    'general.fallback': 'Je peux vous aider pour les réservations, la restauration, les excursions, le bien-être et les déplacements.',
    'general.helpOptions': 'Demandez les circuits de whisky, la location de vélos électriques, les soins spa ou les randonnées.',
    'language.english': 'English',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.spanish': 'Español',
    'language.gaelic': 'Gàidhlig',
  },
  de: {
    'welcome.greeting': 'Fàilte! Ich bin der Concierge des Schiehallion Hotels.',
    'welcome.capabilities': 'Fragen Sie nach Zimmern, Kulinarik, Whisky-Touren oder versteckten Perthshire-Erlebnissen.',
    'welcome.prompt': 'Wie darf ich Ihren Aufenthalt gestalten?',
    'input.placeholder': 'Fragen Sie nach Verfügbarkeit, Speisen oder Ausflügen…',
    'quick.attractions': 'Tag planen',
    'quick.booking': 'Daten prüfen',
    'quick.dining': 'Menühilfe',
    'attractions.intro': 'Diese Erlebnisse passen zu Ihren Wünschen:',
    'attractions.detail': '{name} · {distance} km • {duration} Min. Anreise • Perfekt für {highlights}',
    'attractions.link': 'Buchen oder mehr erfahren',
    'attractions.hours': 'Heute geöffnet: {hours}',
    'attractions.followUp': 'Benötigen Sie Tipps zu Tickets oder Transport?',
    'attractions.noMatch': 'Ich merke mir das – darf ich solange eine Perthshire-Route empfehlen?',
    'booking.askDates': 'Nennen Sie mir An- und Abreise, damit ich Verfügbarkeit prüfen kann.',
    'booking.summary': 'Ich kann Sie vom {checkIn} bis {checkOut} für {nights} Nacht/Nächte unterbringen. Offen sind derzeit:',
    'booking.roomLine': '{room} · für {guests} Gäste · ab £{price} pro Nacht',
    'booking.noAvailability': 'Diese Daten sind gefragt! Ich kann Alternativen prüfen oder Sie vormerken.',
    'booking.followUp': 'Bereit zur Online-Buchung? Ich führe Sie direkt hin.',
    'booking.action': 'Buchung starten',
    'restaurant.intro': 'Das passt heute zu Ihren kulinarischen Wünschen:',
    'restaurant.noMatch': 'Ich spreche mit der Küche – sollen wir ein Gericht anpassen oder Chef\'s Table planen?',
    'restaurant.followUp': 'Soll ich einen Tisch reservieren oder Notizen für das Team hinterlegen?',
    'restaurant.action': 'Tisch reservieren',
    'restaurant.pairing': 'Empfohlene Begleitung: {pairing}',
    'restaurant.special': 'Heutige Empfehlung: {special}',
    'general.fallback': 'Ich helfe bei Buchungen, Kulinarik, Ausflügen, Wellness und Reiseplanung.',
    'general.helpOptions': 'Fragen Sie nach Whisky-Touren, E-Bike-Verleih, Spa-Ritualen oder Wanderinfos.',
    'language.english': 'English',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.spanish': 'Español',
    'language.gaelic': 'Gàidhlig',
  },
  es: {
    'welcome.greeting': 'Fàilte! Soy el conserje del hotel Schiehallion.',
    'welcome.capabilities': 'Pregúntame por habitaciones, gastronomía, rutas de whisky o escapadas secretas en Perthshire.',
    'welcome.prompt': '¿Cómo puedo personalizar tu estancia?',
    'input.placeholder': 'Pregunta por disponibilidad, cena o aventuras locales…',
    'quick.attractions': 'Planear el día',
    'quick.booking': 'Consultar fechas',
    'quick.dining': 'Ayuda de menú',
    'attractions.intro': 'Estas experiencias encajan con lo que buscas:',
    'attractions.detail': '{name} · {distance} km • {duration} min de viaje • Ideal para {highlights}',
    'attractions.link': 'Reservar o saber más',
    'attractions.hours': 'Abierto hoy: {hours}',
    'attractions.followUp': '¿Necesitas consejos de transporte o entradas?',
    'attractions.noMatch': 'Lo tendré presente; mientras tanto, ¿quieres un itinerario personalizado por Perthshire?',
    'booking.askDates': 'Dime tus fechas de llegada y salida para confirmar disponibilidad.',
    'booking.summary': 'Puedo alojarte del {checkIn} al {checkOut} durante {nights} noche(s). Ahora mismo tenemos:',
   'booking.roomLine': '{room} · hasta {guests} huéspedes · desde £{price} por noche',
    'booking.noAvailability': '¡Esas fechas son muy solicitadas! Puedo revisar otras o ponerte en lista de espera.',
    'booking.followUp': '¿Continuamos online? Te llevo al formulario de reserva.',
    'booking.action': 'Iniciar reserva',
    'restaurant.intro': 'Esto se ajusta a tus preferencias gastronómicas de hoy:',
    'restaurant.noMatch': 'Avisaré a la cocina – ¿adaptamos un plato o hablamos de la mesa del chef?',
    'restaurant.followUp': '¿Reservo una mesa o añado notas para el equipo?',
    'restaurant.action': 'Reservar mesa',
    'restaurant.pairing': 'Maridaje sugerido: {pairing}',
    'restaurant.special': 'Especial de hoy: {special}',
    'general.fallback': 'Puedo ayudarte con reservas, gastronomía, excursiones, bienestar y traslados.',
    'general.helpOptions': 'Pregunta por tours de whisky, alquiler de e-bikes, rituales de spa o rutas de senderismo.',
    'language.english': 'English',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.spanish': 'Español',
    'language.gaelic': 'Gàidhlig',
  },
  gd: {
    'welcome.greeting': 'Fàilte! Is mise coimiseanara Taigh-òsta Schiehallion.',
    'welcome.capabilities': 'Faighnich mu sheòmraichean, biadh, slighean uisge-beatha no dàn-thursan ann am Pheairt-siorrachd.',
    'welcome.prompt': 'Ciamar as urrainn dhomh an turas agad a dhealbhadh?',
    'input.placeholder': 'Faighnich mu chothroman, biadh no turasan ionadail…',
    'quick.attractions': 'Planadh an latha',
    'quick.booking': 'Dearbhaich cinn-latha',
    'quick.dining': 'Taic clàr-bìdh',
    'attractions.intro': 'Seo cuid de dh\'eòlasan a fhreagras ort:',
    'attractions.detail': '{name} · {distance} km • {duration} mionaidean siubhail • Air leth freagarrach airson {highlights}',
    'attractions.link': 'Glèidh no barrachd fiosrachaidh',
    'attractions.hours': 'Fosgailte an-diugh: {hours}',
    'attractions.followUp': 'A bheil comhairle a dh\'fheumas tu airson còmhdhail no tiogaidean?',
    'attractions.noMatch': 'Cumidh mi sin nam inntinn – an toir mi slighe Pheairt-siorrachd dhut?',
    'booking.askDates': 'Innis dhomh cinn-latha a\' tighinn is falbh gus dearbhadh.',
    'booking.summary': 'Gabhaidh sinn riut bho {checkIn} gu {checkOut} airson {nights} oidhche(an). Seo na seòmraichean a tha fosgailte:',
    'booking.roomLine': '{room} · airson suas ri {guests} aoigh · bho £{price} gach oidhche',
    'booking.noAvailability': 'Tha na cinn-latha sin trang! Nì mi sgrùdadh air roghainnean eile no liosta-fheitheamh.',
    'booking.followUp': 'Deiseil airson leantainn air-loidhne? Treòraichidh mi thu dhan fhoirm.',
    'booking.action': 'Tòisich air a\' ghlèidheadh',
    'restaurant.intro': 'Seo na tha freagarrach dhut air a\' chlàr an-diugh:',
    'restaurant.noMatch': 'Innsidh mi dhan chidsin – am bu chòir dhuinn biadh atharrachadh no bòrd an t-seòmair-chòcaire a chur air dòigh?',
    'restaurant.followUp': 'Am bu chòir dhomh bòrd a ghlèidheadh no notaichean a chur dhan sgioba?',
    'restaurant.action': 'Glèidh bòrd',
    'restaurant.pairing': 'Moladh deoch: {pairing}',
    'restaurant.special': 'Sònraichte na h-oidhche: {special}',
    'general.fallback': 'Cuidichidh mi le seòmraichean, biadh, dàn-thursan, sunnd agus siubhail.',
    'general.helpOptions': 'Faighnich mu thursan uisge-beatha, màl e-baidhsagal, deas-ghnàthan spà no coiseachd.',
    'language.english': 'English',
    'language.french': 'Français',
    'language.german': 'Deutsch',
    'language.spanish': 'Español',
    'language.gaelic': 'Gàidhlig',
  },
}

export const languageLabels: Record<SupportedLanguage, string> = {
  en: translations.en['language.english'],
  fr: translations.fr['language.french'],
  de: translations.de['language.german'],
  es: translations.es['language.spanish'],
  gd: translations.gd['language.gaelic'],
}

export function t(language: SupportedLanguage, key: TranslationKey, replacements?: Record<string, string | number>): string {
  const dictionary = translations[language]
  const fallback = translations.en
  const template = dictionary?.[key] || fallback[key] || key

  if (!replacements) {
    return template
  }

  return Object.entries(replacements).reduce((text, [placeholder, value]) => {
    return text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value))
  }, template)
}

export const conciergeTranslations = translations
export type ConciergeTranslationKey = TranslationKey
