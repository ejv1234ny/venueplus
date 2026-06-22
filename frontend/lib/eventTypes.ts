// Canonical event types for VenuePlus.
// Used for: the event-type dropdown (event/booking creation), venue "ideal for"
// tags, search filters, and admin analytics (Event.event_type).
// Grouped for <optgroup> rendering; EVENT_TYPES is a flat list of all values.

export interface EventTypeOption {
  value: string;
  label: string;
}

export interface EventTypeGroup {
  group: string;
  options: EventTypeOption[];
}

export const EVENT_TYPE_GROUPS: EventTypeGroup[] = [
  {
    group: 'Weddings & Engagements',
    options: [
      { value: 'wedding', label: 'Wedding' },
      { value: 'wedding_reception', label: 'Wedding reception' },
      { value: 'elopement', label: 'Elopement' },
      { value: 'engagement_party', label: 'Engagement party' },
      { value: 'rehearsal_dinner', label: 'Rehearsal dinner' },
      { value: 'bridal_shower', label: 'Bridal shower' },
      { value: 'bachelor_party', label: 'Bachelor party' },
      { value: 'bachelorette_party', label: 'Bachelorette party' },
      { value: 'vow_renewal', label: 'Vow renewal' },
    ],
  },
  {
    group: 'Birthdays & Anniversaries',
    options: [
      { value: 'birthday', label: 'Birthday party' },
      { value: 'milestone_birthday', label: 'Milestone birthday (30/40/50/…)' },
      { value: 'kids_birthday', label: "Kids' birthday party" },
      { value: 'sweet_sixteen', label: 'Sweet sixteen' },
      { value: 'anniversary', label: 'Anniversary party' },
      { value: 'retirement_party', label: 'Retirement party' },
    ],
  },
  {
    group: 'Family & Life Milestones',
    options: [
      { value: 'baby_shower', label: 'Baby shower' },
      { value: 'gender_reveal', label: 'Gender reveal' },
      { value: 'family_reunion', label: 'Family reunion' },
      { value: 'housewarming', label: 'Housewarming' },
      { value: 'graduation_party', label: 'Graduation party' },
      { value: 'celebration_of_life', label: 'Celebration of life' },
      { value: 'memorial_reception', label: 'Memorial / wake reception' },
    ],
  },
  {
    group: 'Cultural & Religious',
    options: [
      { value: 'bar_mitzvah', label: 'Bar mitzvah' },
      { value: 'bat_mitzvah', label: 'Bat mitzvah' },
      { value: 'quinceanera', label: 'Quinceañera' },
      { value: 'baptism_christening', label: 'Baptism / christening' },
      { value: 'first_communion', label: 'First communion' },
      { value: 'confirmation', label: 'Confirmation' },
      { value: 'naming_ceremony', label: 'Naming ceremony' },
      { value: 'religious_gathering', label: 'Religious service / gathering' },
      { value: 'cultural_festival', label: 'Cultural festival' },
      { value: 'holiday_celebration', label: 'Holiday / seasonal celebration' },
    ],
  },
  {
    group: 'Corporate & Professional',
    options: [
      { value: 'corporate_party', label: 'Corporate / company party' },
      { value: 'holiday_party', label: 'Company holiday party' },
      { value: 'team_offsite', label: 'Team offsite / retreat' },
      { value: 'conference', label: 'Conference' },
      { value: 'seminar_workshop', label: 'Seminar / workshop' },
      { value: 'product_launch', label: 'Product launch' },
      { value: 'networking_event', label: 'Networking event / mixer' },
      { value: 'award_gala', label: 'Award ceremony / gala' },
      { value: 'meeting', label: 'Meeting / board meeting' },
      { value: 'training_session', label: 'Training session' },
      { value: 'trade_show', label: 'Trade show / expo' },
      { value: 'press_event', label: 'Press / media event' },
      { value: 'popup_office', label: 'Pop-up office / coworking day' },
    ],
  },
  {
    group: 'Social & Dining',
    options: [
      { value: 'cocktail_party', label: 'Cocktail party' },
      { value: 'dinner_party', label: 'Dinner party' },
      { value: 'brunch', label: 'Brunch' },
      { value: 'themed_party', label: 'Themed party' },
      { value: 'game_watch_party', label: 'Game / watch party' },
      { value: 'reunion', label: 'Reunion (class/school)' },
      { value: 'block_party', label: 'Block / neighborhood party' },
    ],
  },
  {
    group: 'Arts, Music & Production',
    options: [
      { value: 'concert', label: 'Concert / live music' },
      { value: 'dj_dance_party', label: 'DJ / dance party' },
      { value: 'art_exhibition', label: 'Art exhibition / gallery show' },
      { value: 'film_screening', label: 'Film screening' },
      { value: 'theater_performance', label: 'Theater / performance' },
      { value: 'comedy_open_mic', label: 'Comedy / open mic' },
      { value: 'fashion_show', label: 'Fashion show' },
      { value: 'photo_shoot', label: 'Photo shoot' },
      { value: 'video_production', label: 'Film / video production' },
    ],
  },
  {
    group: 'Community, Civic & Nonprofit',
    options: [
      { value: 'fundraiser', label: 'Fundraiser / charity event' },
      { value: 'benefit_gala', label: 'Benefit gala' },
      { value: 'auction', label: 'Auction' },
      { value: 'town_hall', label: 'Town hall / community meeting' },
      { value: 'club_meeting', label: 'Club / organization meeting' },
      { value: 'political_event', label: 'Political / campaign event' },
      { value: 'volunteer_event', label: 'Volunteer event' },
    ],
  },
  {
    group: 'Markets, Pop-ups & Tastings',
    options: [
      { value: 'popup_shop', label: 'Pop-up shop / retail' },
      { value: 'market_fair', label: 'Market / craft fair' },
      { value: 'food_truck_event', label: 'Food truck event / tasting' },
      { value: 'wine_beer_tasting', label: 'Wine / beer tasting' },
    ],
  },
  {
    group: 'Wellness & Sports',
    options: [
      { value: 'fitness_class', label: 'Fitness / yoga class' },
      { value: 'wellness_retreat', label: 'Wellness retreat' },
      { value: 'dance_class', label: 'Dance class' },
      { value: 'sports_event', label: 'Sports event / tournament' },
    ],
  },
  {
    group: 'Outdoor & Seasonal',
    options: [
      { value: 'picnic', label: 'Picnic' },
      { value: 'bbq_cookout', label: 'BBQ / cookout' },
      { value: 'garden_party', label: 'Garden party' },
      { value: 'festival', label: 'Festival' },
      { value: 'car_show', label: 'Car show' },
    ],
  },
  {
    group: 'Other',
    options: [
      { value: 'prom_school_dance', label: 'Prom / school dance' },
      { value: 'workshop', label: 'Workshop / class (general)' },
      { value: 'other', label: 'Other' },
    ],
  },
];

// Flat list of all options (handy for validation, search facets, analytics labels).
export const EVENT_TYPES: EventTypeOption[] = EVENT_TYPE_GROUPS.flatMap((g) => g.options);

// value -> label lookup
export const EVENT_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  EVENT_TYPES.map((o) => [o.value, o.label])
);
