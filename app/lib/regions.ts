// Regional dietary data — food availability and evidence-based dietary guidance
// by world region. Scientific sources cited inline.
//
// Food availability is factual (USDA, FAO food balance sheets).
// Dietary guidance draws from national/WHO guidelines:
//   - WHO healthy diet fact sheet (2020)
//   - India: ICMR-NIN Dietary Guidelines (2020)
//   - Japan: Japanese Food Guide Spinning Top (MHLW, 2005)
//   - Mediterranean: PREDIMED trial (Estruch et al. 2018, NEJM)
//   - DASH: NHLBI DASH eating plan
//   - Latin America: PAHO/WHO dietary guidelines
//   - Nordic: Nordic Nutrition Recommendations (2023)
//   - Sub-Saharan Africa: FAO/WHO regional guidelines
//   - Middle East: Gulf Cooperation Council dietary guidelines

export type Region =
  | "global"
  | "north_america"
  | "south_america"
  | "western_europe"
  | "eastern_europe"
  | "east_asia"
  | "south_asia"
  | "southeast_asia"
  | "middle_east"
  | "sub_saharan_africa"
  | "oceania";

// ── Countries → Region mapping ─────────────────────────────────────────────
export interface Country {
  id: string;
  label: string;
  region: Region;
}

export const COUNTRIES: Country[] = [
  // North America
  { id: "us", label: "United States", region: "north_america" },
  { id: "ca", label: "Canada", region: "north_america" },
  { id: "mx", label: "Mexico", region: "north_america" },
  // South America
  { id: "br", label: "Brazil", region: "south_america" },
  { id: "ar", label: "Argentina", region: "south_america" },
  { id: "co", label: "Colombia", region: "south_america" },
  { id: "pe", label: "Peru", region: "south_america" },
  { id: "cl", label: "Chile", region: "south_america" },
  { id: "ve", label: "Venezuela", region: "south_america" },
  // Western Europe
  { id: "gb", label: "United Kingdom", region: "western_europe" },
  { id: "fr", label: "France", region: "western_europe" },
  { id: "de", label: "Germany", region: "western_europe" },
  { id: "es", label: "Spain", region: "western_europe" },
  { id: "it", label: "Italy", region: "western_europe" },
  { id: "nl", label: "Netherlands", region: "western_europe" },
  { id: "be", label: "Belgium", region: "western_europe" },
  { id: "pt", label: "Portugal", region: "western_europe" },
  { id: "ch", label: "Switzerland", region: "western_europe" },
  { id: "at", label: "Austria", region: "western_europe" },
  { id: "se", label: "Sweden", region: "western_europe" },
  { id: "no", label: "Norway", region: "western_europe" },
  { id: "dk", label: "Denmark", region: "western_europe" },
  { id: "fi", label: "Finland", region: "western_europe" },
  { id: "ie", label: "Ireland", region: "western_europe" },
  { id: "gr", label: "Greece", region: "western_europe" },
  // Eastern Europe
  { id: "pl", label: "Poland", region: "eastern_europe" },
  { id: "cz", label: "Czech Republic", region: "eastern_europe" },
  { id: "ro", label: "Romania", region: "eastern_europe" },
  { id: "ua", label: "Ukraine", region: "eastern_europe" },
  { id: "ru", label: "Russia", region: "eastern_europe" },
  { id: "hu", label: "Hungary", region: "eastern_europe" },
  // East Asia
  { id: "jp", label: "Japan", region: "east_asia" },
  { id: "kr", label: "South Korea", region: "east_asia" },
  { id: "cn", label: "China", region: "east_asia" },
  { id: "tw", label: "Taiwan", region: "east_asia" },
  // South Asia
  { id: "in", label: "India", region: "south_asia" },
  { id: "pk", label: "Pakistan", region: "south_asia" },
  { id: "bd", label: "Bangladesh", region: "south_asia" },
  { id: "lk", label: "Sri Lanka", region: "south_asia" },
  { id: "np", label: "Nepal", region: "south_asia" },
  // Southeast Asia
  { id: "th", label: "Thailand", region: "southeast_asia" },
  { id: "vn", label: "Vietnam", region: "southeast_asia" },
  { id: "id", label: "Indonesia", region: "southeast_asia" },
  { id: "ph", label: "Philippines", region: "southeast_asia" },
  { id: "my", label: "Malaysia", region: "southeast_asia" },
  { id: "sg", label: "Singapore", region: "southeast_asia" },
  { id: "mm", label: "Myanmar", region: "southeast_asia" },
  // Middle East
  { id: "sa", label: "Saudi Arabia", region: "middle_east" },
  { id: "ae", label: "UAE", region: "middle_east" },
  { id: "tr", label: "Turkey", region: "middle_east" },
  { id: "ir", label: "Iran", region: "middle_east" },
  { id: "iq", label: "Iraq", region: "middle_east" },
  { id: "il", label: "Israel", region: "middle_east" },
  { id: "eg", label: "Egypt", region: "middle_east" },
  // Sub-Saharan Africa
  { id: "ng", label: "Nigeria", region: "sub_saharan_africa" },
  { id: "ke", label: "Kenya", region: "sub_saharan_africa" },
  { id: "za", label: "South Africa", region: "sub_saharan_africa" },
  { id: "et", label: "Ethiopia", region: "sub_saharan_africa" },
  { id: "gh", label: "Ghana", region: "sub_saharan_africa" },
  { id: "tz", label: "Tanzania", region: "sub_saharan_africa" },
  // Oceania
  { id: "au", label: "Australia", region: "oceania" },
  { id: "nz", label: "New Zealand", region: "oceania" },
];

// ── States / regions per country ───────────────────────────────────────────
// Only countries with meaningful state-level dietary differences are listed.
// Key source: state-level dietary pattern research, USDA ERS, ICMR-NIN state data.

export interface State {
  id: string;
  label: string;
  /** Optional: food availability note for this state */
  note?: string;
}

export const STATES: Record<string, State[]> = {
  // ── United States ────────────────────────────────────────────────────────
  // USDA ERS food atlas; CDC BRFSS dietary data by state.
  us: [
    { id: "AL", label: "Alabama", note: "Southern diet: fried foods, legumes, collard greens" },
    { id: "AK", label: "Alaska", note: "High fish/seafood availability, wild game" },
    { id: "AZ", label: "Arizona", note: "Southwest: beans, peppers, citrus" },
    { id: "AR", label: "Arkansas", note: "Southern: rice, catfish, poultry" },
    { id: "CA", label: "California", note: "High produce diversity, farm-to-table culture" },
    { id: "CO", label: "Colorado", note: "Health-conscious, active lifestyle state" },
    { id: "CT", label: "Connecticut", note: "New England: seafood, dairy, apples" },
    { id: "DE", label: "Delaware" },
    { id: "FL", label: "Florida", note: "Tropical produce, citrus, seafood" },
    { id: "GA", label: "Georgia", note: "Peaches, peanuts, Southern cuisine" },
    { id: "HI", label: "Hawaii", note: "Pacific/Asian influences, tropical fruit, fish" },
    { id: "ID", label: "Idaho", note: "Potatoes, trout, dairy" },
    { id: "IL", label: "Illinois", note: "Midwest: corn, soybeans, pork" },
    { id: "IN", label: "Indiana", note: "Midwest: corn, pork, popcorn" },
    { id: "IA", label: "Iowa", note: "Corn, pork, dairy heartland" },
    { id: "KS", label: "Kansas", note: "Wheat belt, beef, sunflowers" },
    { id: "KY", label: "Kentucky", note: "Bourbon, tobacco, Southern comfort food" },
    { id: "LA", label: "Louisiana", note: "Cajun/Creole: rice, seafood, okra, gumbos" },
    { id: "ME", label: "Maine", note: "Lobster, blueberries, maple syrup" },
    { id: "MD", label: "Maryland", note: "Chesapeake Bay crab, seafood" },
    { id: "MA", label: "Massachusetts", note: "New England: seafood, cranberries, beans" },
    { id: "MI", label: "Michigan", note: "Cherries, blueberries, apples, Great Lakes fish" },
    { id: "MN", label: "Minnesota", note: "Wild rice, walleye, dairy" },
    { id: "MS", label: "Mississippi", note: "Southern: catfish, greens, cornbread" },
    { id: "MO", label: "Missouri", note: "Midwest: BBQ, corn, soybeans" },
    { id: "MT", label: "Montana", note: "Ranch country, bison, wild game" },
    { id: "NE", label: "Nebraska", note: "Beef state, corn, wheat" },
    { id: "NV", label: "Nevada" },
    { id: "NH", label: "New Hampshire", note: "Maple syrup, apples, dairy" },
    { id: "NJ", label: "New Jersey", note: "Garden State: tomatoes, blueberries, cranberries" },
    { id: "NM", label: "New Mexico", note: "Southwest: chiles, beans, corn, piñon nuts" },
    { id: "NY", label: "New York", note: "Diverse: bagels, apples, dairy, seafood" },
    { id: "NC", label: "North Carolina", note: "Sweet potatoes, vinegar-based BBQ, peanuts" },
    { id: "ND", label: "North Dakota", note: "Wheat, sunflowers, bison" },
    { id: "OH", label: "Ohio", note: "Midwest: corn, soybeans, buckeyes" },
    { id: "OK", label: "Oklahoma", note: "Pecans, wheat, beef" },
    { id: "OR", label: "Oregon", note: "Berries, hazelnuts, salmon, farm-to-table" },
    { id: "PA", label: "Pennsylvania", note: "Mushrooms, chocolate, pretzels, dairy" },
    { id: "RI", label: "Rhode Island", note: "Seafood, stuffies (clams)" },
    { id: "SC", label: "South Carolina", note: "Peaches, shrimp, Lowcountry cuisine" },
    { id: "SD", label: "South Dakota", note: "Bison, wheat, sunflowers" },
    { id: "TN", label: "Tennessee", note: "Nashville hot chicken, whiskey, legumes" },
    { id: "TX", label: "Texas", note: "Tex-Mex: beef, beans, chiles, citrus (Rio Grande)" },
    { id: "UT", label: "Utah", note: "Beehive state: dairy, cherries, fry sauce" },
    { id: "VT", label: "Vermont", note: "Maple syrup, cheddar, apples, organic farming" },
    { id: "VA", label: "Virginia", note: "Ham, peanuts, oysters, Shenandoah apples" },
    { id: "WA", label: "Washington", note: "Apples, cherries, salmon, hops, berries" },
    { id: "WV", label: "West Virginia", note: "Apples, maple, wild game" },
    { id: "WI", label: "Wisconsin", note: "Dairy state: cheese, cranberries, cherries" },
    { id: "WY", label: "Wyoming", note: "Ranch: beef, trout, game" },
  ],

  // ── India ─────────────────────────────────────────────────────────────────
  // ICMR-NIN state-level dietary surveys; NFHS-4 (2015-16) state data.
  in: [
    { id: "AN", label: "Andhra Pradesh", note: "Rice-based, fish, tamarind, coconut" },
    { id: "AR", label: "Arunachal Pradesh", note: "Rice, bamboo shoots, fermented foods" },
    { id: "AS", label: "Assam", note: "Rice, fish, bamboo shoots, mustard greens" },
    { id: "BR", label: "Bihar", note: "Litti-chokha, sattu (roasted gram), litchi" },
    { id: "CG", label: "Chhattisgarh", note: "Rice, mahua, kutki, forest greens" },
    { id: "GA", label: "Goa", note: "Fish curry, rice, coconut, kokum" },
    { id: "GJ", label: "Gujarat", note: "Vegetarian-heavy, millet, jaggery, kadhi" },
    { id: "HR", label: "Haryana", note: "Wheat, dairy (ghee, lassi), mustard oil" },
    { id: "HP", label: "Himachal Pradesh", note: "Apple, wheat, rajma, trout" },
    { id: "JH", label: "Jharkhand", note: "Rice, dal, mahua, forest greens" },
    { id: "KA", label: "Karnataka", note: "Rice, ragi (finger millet), coconut, fish (coastal)" },
    { id: "KL", label: "Kerala", note: "Rice, coconut, fish, tapioca, curry leaves" },
    { id: "MP", label: "Madhya Pradesh", note: "Wheat, dal, poha, bhutte ka kees" },
    { id: "MH", label: "Maharashtra", note: "Rice (coastal), wheat (interior), vada pav, puran poli" },
    { id: "MN", label: "Manipur", note: "Rice, fermented bamboo, fish, lotus stem" },
    { id: "ML", label: "Meghalaya", note: "Rice, betel nut, jadoh (rice-meat dish)" },
    { id: "MZ", label: "Mizoram", note: "Rice, bamboo, banana flower, smoked meat" },
    { id: "NL", label: "Nagaland", note: "Rice, fermented soybean (axone), smoked meat" },
    { id: "OD", label: "Odisha", note: "Rice, dal, pakhala (fermented rice), fish" },
    { id: "PB", label: "Punjab", note: "Wheat (roti/naan), dairy (paneer, lassi), mustard oil" },
    { id: "RJ", label: "Rajasthan", note: "Wheat, dal baati, bajra (millet), ker sangri" },
    { id: "SK", label: "Sikkim", note: "Rice, fermented foods, buckwheat, yak cheese" },
    { id: "TN", label: "Tamil Nadu", note: "Rice, sambar, rasam, coconut, tamarind" },
    { id: "TS", label: "Telangana", note: "Rice, millet, hyderabadi cuisine, tamarind" },
    { id: "TR", label: "Tripura", note: "Rice, bamboo, berma (fermented fish)" },
    { id: "UP", label: "Uttar Pradesh", note: "Wheat (roti), dal, chaat, mustard oil" },
    { id: "UK", label: "Uttarakhand", note: "Wheat, mandua (finger millet), rajma, kafuli (greens)" },
    { id: "WB", label: "West Bengal", note: "Rice, fish, mustard oil, sweets (rasgulla)" },
    { id: "DL", label: "Delhi (NCT)", note: "Mixed: street food culture, diverse cuisines" },
  ],

  // ── United Kingdom ────────────────────────────────────────────────────────
  gb: [
    { id: "ENG", label: "England" },
    { id: "SCT", label: "Scotland", note: "Porridge (oats), haggis, salmon, game" },
    { id: "WLS", label: "Wales", note: "Lamb, leeks, Welsh rarebit (cheese on toast)" },
    { id: "NIR", label: "Northern Ireland", note: "Potato bread, soda bread, Ulster fry" },
  ],

  // ── Australia ─────────────────────────────────────────────────────────────
  au: [
    { id: "NSW", label: "New South Wales" },
    { id: "VIC", label: "Victoria" },
    { id: "QLD", label: "Queensland", note: "Tropical fruit, seafood, macadamia" },
    { id: "WA", label: "Western Australia", note: "Seafood, mangoes, lamb" },
    { id: "SA", label: "South Australia", note: "Wine region, seafood, Barossa lamb" },
    { id: "TAS", label: "Tasmania", note: "Cool climate produce, seafood, berries" },
    { id: "NT", label: "Northern Territory", note: "Tropical: barramundi, mangoes, bush foods" },
    { id: "ACT", label: "Australian Capital Territory" },
  ],

  // ── Canada ────────────────────────────────────────────────────────────────
  ca: [
    { id: "AB", label: "Alberta", note: "Beef, canola, wheat" },
    { id: "BC", label: "British Columbia", note: "Seafood, salmon, berries, diverse produce" },
    { id: "MB", label: "Manitoba", note: "Wheat, flax, wild rice" },
    { id: "NB", label: "New Brunswick", note: "Seafood (lobster, crab), potatoes" },
    { id: "NL", label: "Newfoundland & Labrador", note: "Cod, caribou, berries" },
    { id: "NS", label: "Nova Scotia", note: "Lobster, scallops, apples" },
    { id: "ON", label: "Ontario", note: "Diverse: corn, peaches, dairy" },
    { id: "PE", label: "Prince Edward Island", note: "Potatoes, lobster, mussels" },
    { id: "QC", label: "Quebec", note: "Maple syrup, poutine culture, dairy" },
    { id: "SK", label: "Saskatchewan", note: "Wheat, lentils, canola" },
  ],

  // ── Brazil ────────────────────────────────────────────────────────────────
  br: [
    { id: "SP", label: "São Paulo", note: "Diverse: pasta, pizza, Japanese-Brazilian food" },
    { id: "RJ", label: "Rio de Janeiro", note: "Seafood, tropical fruit, feijoada" },
    { id: "MG", label: "Minas Gerais", note: "Cheese, coffee, beans, pão de queijo" },
    { id: "BA", label: "Bahia", note: "Afro-Brazilian: dendê (palm oil), coconut, seafood" },
    { id: "RS", label: "Rio Grande do Sul", note: "Gaucho: churrasco, wine, dairy" },
    { id: "PR", label: "Paraná", note: "Soybeans, wheat, coffee, southern cuisine" },
    { id: "AM", label: "Amazonas", note: "Fish, açaí, tropical fruit, cassava" },
    { id: "CE", label: "Ceará", note: "Cassava, cashew, seafood" },
    { id: "PE", label: "Pernambuco", note: "Tapioca, tropical fruit, seafood" },
    { id: "DF", label: "Distrito Federal (Brasília)" },
  ],

  // ── Japan ─────────────────────────────────────────────────────────────────
  jp: [
    { id: "TKY", label: "Tokyo", note: "Sushi, ramen, diverse izakaya culture" },
    { id: "OSK", label: "Osaka", note: "Street food: takoyaki, okonomiyaki, kushikatsu" },
    { id: "FKO", label: "Fukuoka", note: "Hakata ramen, mentaiko, mizutaki" },
    { id: "HKD", label: "Hokkaido", note: "Seafood, dairy, potatoes, miso ramen" },
    { id: "KNG", label: "Kanagawa", note: "Yokohama ramen, chinatown, shirasu" },
    { id: "AIC", label: "Aichi (Nagoya)", note: "Miso-katsu, hitsumabushi (eel), kishimen" },
  ],
};

// Lookup helper: get states for a country (empty array if none defined)
export function statesForCountry(countryId: string): State[] {
  return STATES[countryId] ?? [];
}

// ── Region-specific dietary guidance ───────────────────────────────────────
// Based on national dietary guidelines and peer-reviewed research.
export interface RegionalGuidance {
  region: Region;
  label: string;
  /** Primary dietary pattern name */
  pattern: string;
  /** Key principles (2–4 bullet points, evidence-based) */
  principles: string[];
  /** Common local staples the meal plan should prioritize */
  stapleProteins: string[];
  stapleGrains: string[];
  stapleVeg: string[];
  stapleFats: string[];
  /** Supplements with region-specific evidence */
  supplements: { name: string; reason: string }[];
  /** Water intake note (hot climates need more) */
  waterNote: string;
}

export const REGIONAL_GUIDANCE: Record<Region, RegionalGuidance> = {
  global: {
    region: "global",
    label: "General",
    pattern: "Balanced whole-foods diet",
    principles: [
      "Half your plate vegetables and fruit (Harvard Healthy Eating Plate).",
      "Quarter whole grains, quarter lean protein.",
      "Minimize ultra-processed foods, sugary drinks, and excess sodium.",
    ],
    stapleProteins: [],
    stapleGrains: [],
    stapleVeg: [],
    stapleFats: [],
    supplements: [],
    waterNote: "NASEM adequate intake: 3.7 L/day (men), 2.7 L/day (women).",
  },
  north_america: {
    region: "north_america",
    label: "North America",
    pattern: "USDA Dietary Guidelines / DASH",
    principles: [
      "USDA MyPlate: half fruits/vegetables, quarter grains (half whole), quarter protein.",
      "DASH-style: high potassium (fruits, vegetables), low sodium (<2,300 mg/day).",
      "Limit added sugars to <10% of calories (USDA 2020–2025).",
      "Emphasize variety: seafood 2×/week, legumes, nuts, seeds.",
    ],
    stapleProteins: ["chicken-breast", "chicken-thigh", "beef-sirloin", "beef-mince", "salmon", "tuna", "shrimp", "egg", "greek-yogurt-0", "cottage-cheese", "black-beans", "lentils"],
    stapleGrains: ["oats", "brown-rice", "quinoa", "whole-wheat-pasta", "whole-wheat-bread", "sweet-potato", "potato", "corn-tortilla"],
    stapleVeg: ["broccoli", "spinach", "kale", "bell-pepper", "carrot", "tomato", "sweet-corn", "green-beans", "cauliflower", "avocado"],
    stapleFats: ["olive-oil", "almonds", "walnuts", "avocado", "peanut-butter", "chia-seeds"],
    supplements: [
      { name: "Vitamin D", reason: "Deficiency common in northern US/Canada (latitudes >35°N); 1,000–2,000 IU/day if levels low." },
      { name: "Omega-3 (fish oil)", reason: "Most Americans don't eat enough fatty fish; 1–2 g EPA+DHA/day if fish intake is low." },
    ],
    waterNote: "3.7 L/day (men), 2.7 L/day (women) — NASEM. Increase 500 mL per hour of exercise.",
  },
  south_america: {
    region: "south_america",
    label: "South America",
    pattern: "PAHO/WHO dietary guidelines + traditional staples",
    principles: [
      "Base meals on locally available staples: rice, beans, corn, potatoes, root vegetables.",
      "Beans and legumes are primary plant protein — combine with grains for complete amino acids.",
      "Limit ultra-processed foods and sugary beverages (PAHO 2017).",
      "Use native oils (palm, sunflower, olive in southern cone) — avoid trans fats.",
    ],
    stapleProteins: ["chicken-breast", "beef-sirloin", "beef-mince", "egg", "black-beans", "lentils", "shrimp", "salmon", "sardines", "cheese"],
    stapleGrains: ["brown-rice", "white-rice", "quinoa", "oats", "corn-tortilla", "sweet-potato", "potato"],
    stapleVeg: ["tomato", "onion", "bell-pepper", "avocado", "sweet-corn", "carrot", "cauliflower", "cabbage", "eggplant", "sweet-corn"],
    stapleFats: ["olive-oil", "avocado", "peanut-butter", "sunflower-seeds", "walnuts"],
    supplements: [
      { name: "Folate", reason: "Important for women of childbearing age; leafy greens and fortified foods are key sources." },
    ],
    waterNote: "3.7 L/day (men), 2.7 L/day (women) — increase in tropical climates and during physical work.",
  },
  western_europe: {
    region: "western_europe",
    label: "Western Europe",
    pattern: "Mediterranean / Nordic diet (strongest evidence base)",
    principles: [
      "Mediterranean diet pattern: olive oil, fish, legumes, whole grains, abundant vegetables (PREDIMED trial, Estruch et al. 2018 — 30% reduction in major cardiovascular events).",
      "Nordic diet: focus on root vegetables, berries, oily fish, rye, barley (Nordic Nutrition Recommendations 2023).",
      "Limit processed meats (IARC Group 1 carcinogen); prefer fish, poultry, legumes.",
      "Moderate dairy (fermented preferred: yogurt, kefir, aged cheese).",
    ],
    stapleProteins: ["salmon", "cod", "tuna", "sardines", "chicken-breast", "egg", "lentils", "chickpeas", "greek-yogurt-0", "cottage-cheese", "tofu", "tempeh"],
    stapleGrains: ["oats", "brown-rice", "quinoa", "whole-wheat-pasta", "whole-wheat-bread", "rye-bread", "farro", "barley", "sweet-potato", "potato"],
    stapleVeg: ["spinach", "kale", "broccoli", "tomato", "onion", "mushroom", "asparagus", "zucchini", "eggplant", "cabbage", "bell-pepper", "avocado"],
    stapleFats: ["olive-oil", "walnuts", "almonds", "tahini", "avocado", "flaxseed"],
    supplements: [
      { name: "Vitamin D", reason: "Deficiency common in Scandinavia, UK, northern latitudes (>52°N); 1,000–2,000 IU/day Oct–Mar (Nordic Nutrition Recommendations 2023)." },
      { name: "Omega-3 (fish oil)", reason: "If fish intake <2×/week; 1 g EPA+DHA/day (ESC 2021 guidelines)." },
    ],
    waterNote: "1.5–2 L/day from beverages (EFSA). More in summer or during exercise.",
  },
  eastern_europe: {
    region: "eastern_europe",
    label: "Eastern Europe",
    pattern: "Traditional whole-foods + fermented foods",
    principles: [
      "Base meals on whole grains (buckwheat, rye, barley), root vegetables, and legumes.",
      "Fermented foods (kefir, sauerkraut, pickled vegetables) support gut health — evidence from Zhao et al. 2024 (RCT on soluble fiber and gut microbiota).",
      "Limit processed meats and excess salt — hypertension rates are high in Eastern Europe (WHO Europe 2021).",
      "Include fish 1–2×/week; fatty fish (mackerel, herring) is locally available in the Baltics.",
    ],
    stapleProteins: ["chicken-breast", "beef-sirloin", "pork-tenderloin", "egg", "lentils", "chickpeas", "cottage-cheese", "kefir", "sardines", "cod"],
    stapleGrains: ["buckwheat", "oats", "brown-rice", "rye-bread", "whole-wheat-bread", "barley", "potato", "sweet-potato"],
    stapleVeg: ["cabbage", "beet", "carrot", "onion", "mushroom", "spinach", "broccoli", "tomato", "cucumber", "green-beans"],
    stapleFats: ["sunflower-seeds", "flaxseed", "walnuts", "olive-oil", "kefir"],
    supplements: [
      { name: "Vitamin D", reason: "High deficiency rates in northern regions; 1,000–2,000 IU/day Oct–Mar." },
      { name: "Iodine", reason: "Some Eastern European countries have iodine-deficient soils; use iodized salt or supplement 150 µg/day." },
    ],
    waterNote: "1.5–2 L/day from beverages; herbal teas are culturally common and count toward intake.",
  },
  east_asia: {
    region: "east_asia",
    label: "East Asia",
    pattern: "Traditional Japanese / balanced Asian diet",
    principles: [
      "Japanese Food Guide (MHLW 2005): grain-based with soy, fish, vegetables, and minimal processed food — associated with longest life expectancy globally.",
      "Eat a variety of soy foods daily (tofu, tempeh, edamame, miso) — complete plant protein with isoflavones.",
      "Fish and seafood as primary animal protein (2–3×/week minimum).",
      "Limit added sugars and ultra-processed foods; Japan has among the lowest obesity rates (WHO Western Pacific).",
    ],
    stapleProteins: ["tofu", "tempeh", "edamame", "salmon", "tuna", "cod", "shrimp", "egg", "chicken-breast", "seitan"],
    stapleGrains: ["white-rice", "brown-rice", "oats", "sweet-potato", "buckwheat", "millet", "quinoa"],
    stapleVeg: ["bok-choy", "spinach", "kale", "mushroom", "sweet-corn", "carrot", "tomato", "cucumber", "broccoli", "cabbage", "onion"],
    stapleFats: ["sesame-seeds", "tahini", "olive-oil", "walnuts", "flaxseed", "hemp-seeds"],
    supplements: [
      { name: "Vitamin D", reason: "Deficiency common despite fish intake (limited sun exposure in urban areas); 1,000 IU/day if levels low." },
      { name: "Calcium", reason: "Traditional Asian diets are lower in dairy; ensure adequate intake from tofu (calcium-set), leafy greens, or supplement 500 mg/day if needed." },
    ],
    waterNote: "1.5–2 L/day; green tea counts. Increase in summer (hot, humid monsoon season).",
  },
  south_asia: {
    region: "south_asia",
    label: "South Asia",
    pattern: "ICMR-NIN traditional Indian dietary pattern",
    principles: [
      "ICMR-NIN 2020 guidelines: base meals on cereals (rice/wheat) + pulses/legumes for complete amino acids.",
      "Lentils (dal), chickpeas, and legumes are essential — provide 20–25% of daily protein in traditional diets.",
      "Include dairy daily (milk, curd/yogurt, paneer) unless vegan — calcium and vitamin B12 sources.",
      "Use spices liberally: turmeric (anti-inflammatory — curcumin evidence), cumin, coriander, ginger, garlic.",
      "Limit refined oils and fried foods; use mustard oil, ghee (clarified butter), or coconut oil in moderation.",
    ],
    stapleProteins: ["lentils", "chickpeas", "kidney-beans", "mung-beans", "paneer", "egg", "chicken-breast", "fish", "tofu", "milk-2", "greek-yogurt-0"],
    stapleGrains: ["brown-rice", "white-rice", "oats", "quinoa", "sweet-potato", "potato", "millet", "amaranth"],
    stapleVeg: ["spinach", "cauliflower", "eggplant", "tomato", "onion", "bell-pepper", "carrot", "cabbage", "green-beans", "mushroom"],
    stapleFats: ["ghee", "coconut-milk", "peanut-butter", "sesame-seeds", "tahini", "sunflower-seeds", "olive-oil"],
    supplements: [
      { name: "Vitamin B12", reason: "High deficiency in vegetarians (75% of Indian vegetarians are B12 deficient — Kapil et al. 2016). Supplement 2.4 µg/day or eat fortified foods." },
      { name: "Vitamin D", reason: "High deficiency despite sun exposure (80–90% in some studies — Goswami et al. 2014). 1,000–2,000 IU/day." },
      { name: "Iron", reason: "High prevalence of iron deficiency, especially in women and vegetarians. Combine iron-rich foods with vitamin C for absorption." },
    ],
    waterNote: "2.5–3.5 L/day — higher in tropical climates. Buttermilk (chaas) and coconut water are traditional hydrating beverages.",
  },
  southeast_asia: {
    region: "southeast_asia",
    label: "Southeast Asia",
    pattern: "Traditional rice-based + tropical whole foods",
    principles: [
      "Traditional Southeast Asian diets: rice-based with fish, soy, tropical vegetables, and herbs — associated with lower obesity rates than Western diets.",
      "Fish and seafood as primary protein (abundant and affordable in coastal regions).",
      "Soy foods (tofu, tempeh, soy sauce) are dietary staples — complete plant protein.",
      "Use fresh herbs and spices (turmeric, ginger, lemongrass, galangal) — anti-inflammatory properties.",
      "Limit coconut milk in excess (high saturated fat); use in moderation for flavor.",
    ],
    stapleProteins: ["tofu", "tempeh", "fish", "shrimp", "chicken-breast", "egg", "lentils", "soybeans", "edamame"],
    stapleGrains: ["white-rice", "brown-rice", "oats", "sweet-potato", "millet", "quinoa"],
    stapleVeg: ["bok-choy", "eggplant", "cabbage", "carrot", "tomato", "bell-pepper", "mushroom", "cucumber", "sweet-corn", "spinach"],
    stapleFats: ["coconut-milk", "sesame-seeds", "tahini", "olive-oil", "peanut-butter", "hemp-seeds"],
    supplements: [
      { name: "Vitamin D", reason: "Despite tropical location, indoor lifestyles and dark skin pigmentation increase deficiency risk (Nimitphong et al. 2013). 1,000 IU/day if levels low." },
      { name: "Iodine", reason: "Some Southeast Asian countries have iodine-deficient soils; use iodized salt." },
    ],
    waterNote: "2.5–3.5 L/day — tropical climate requires higher intake. Coconut water and herbal teas are traditional options.",
  },
  middle_east: {
    region: "middle_east",
    label: "Middle East & North Africa",
    pattern: "Traditional Mediterranean / Levantine + halal considerations",
    principles: [
      "Mediterranean-style: olive oil, legumes (chickpeas, lentils), whole grains, fish, and abundant vegetables.",
      "Hummus, falafel, tabbouleh — legume-based meals are protein-rich and evidence-based (high fiber, low GI).",
      "Limit refined carbohydrates (white bread, white rice) and added sugars — diabetes rates are high (IDF Atlas 2021).",
      "Include fermented dairy (labneh, yogurt) for gut health. Dates are nutrient-dense (fiber, potassium, magnesium).",
    ],
    stapleProteins: ["chickpeas", "lentils", "hummus", "chicken-breast", "beef-sirloin", "lamb-lean", "egg", "greek-yogurt-0", "cottage-cheese", "tofu", "fish"],
    stapleGrains: ["brown-rice", "oats", "quinoa", "whole-wheat-bread", "whole-wheat-pasta", "couscous", "barley", "sweet-potato", "potato"],
    stapleVeg: ["tomato", "cucumber", "bell-pepper", "onion", "spinach", "cauliflower", "eggplant", "carrot", "mushroom", "cabbage"],
    stapleFats: ["olive-oil", "tahini", "walnuts", "almonds", "sesame-seeds", "flaxseed"],
    supplements: [
      { name: "Vitamin D", reason: "Paradoxically high deficiency despite sun exposure (limited outdoor time in extreme heat, clothing coverage); 1,000–2,000 IU/day (Al-Daghri et al. 2012)." },
      { name: "Folate", reason: "Important for women of childbearing age; found in legumes and leafy greens — key staples in this region." },
    ],
    waterNote: "3–4 L/day — arid climate with high temperatures. Avoid sugary drinks; water, tea, and laban (buttermilk) are traditional.",
  },
  sub_saharan_africa: {
    region: "sub_saharan_africa",
    label: "Sub-Saharan Africa",
    pattern: "Traditional whole-foods + legume-based",
    principles: [
      "Base meals on locally available staples: tubers (cassava, sweet potato), legumes, millet, sorghum, and leafy greens.",
      "Legumes (beans, groundnuts/peanuts, lentils) are affordable, nutrient-dense protein sources — WHO recommends ≥2 servings/day.",
      "Dark leafy greens (moringa, amaranth, cassava leaves) are micronutrient powerhouses — eat daily.",
      "Limit refined grains and sugary processed foods — obesity and diabetes are rising in urban Africa (WHO AFRO 2022).",
    ],
    stapleProteins: ["peanut-butter", "lentils", "chickpeas", "black-beans", "kidney-beans", "egg", "chicken-breast", "sardines", "anchovies", "tofu"],
    stapleGrains: ["sweet-potato", "oats", "brown-rice", "millet", "quinoa", "amaranth", "barley", "potato"],
    stapleVeg: ["spinach", "kale", "cabbage", "tomato", "onion", "carrot", "sweet-corn", "eggplant", "bell-pepper", "green-beans"],
    stapleFats: ["peanut-butter", "sunflower-seeds", "flaxseed", "olive-oil", "pumpkin-seeds"],
    supplements: [
      { name: "Vitamin A", reason: "Deficiency is a leading cause of preventable blindness in children; orange/dark green vegetables and sweet potato are key sources (WHO 2023)." },
      { name: "Iron", reason: "High prevalence of iron-deficiency anemia; combine legumes/grains with vitamin C-rich foods (tomatoes, citrus) for absorption." },
      { name: "Zinc", reason: "Phytate-rich diets (whole grains, legumes) reduce zinc absorption; supplement if deficient (WHO 2023)." },
    ],
    waterNote: "2.5–3.5 L/day — higher in hot/humid regions. Ensure water is safe (boiled or filtered).",
  },
  oceania: {
    region: "oceania",
    label: "Australia & New Zealand",
    pattern: "Australian Dietary Guidelines / NZ Nutrition",
    principles: [
      "Australian Dietary Guidelines (2013): variety across 5 food groups daily — vegetables, fruit, grains, lean meat/protein, dairy.",
      "Emphasize lean proteins (chicken, fish, legumes) and limit red meat (linked to colorectal cancer — WCRF 2018).",
      "Whole grains (oats, brown rice, quinoa) over refined; limit discretionary foods (WHO recommends <10% energy from free sugars).",
      "Include calcium-rich foods daily (dairy, fortified plant milks, leafy greens) — osteoporosis prevention.",
    ],
    stapleProteins: ["chicken-breast", "salmon", "tuna", "beef-sirloin", "egg", "greek-yogurt-0", "cottage-cheese", "lentils", "chickpeas", "tofu", "tempeh"],
    stapleGrains: ["oats", "brown-rice", "quinoa", "whole-wheat-bread", "whole-wheat-pasta", "sweet-potato", "potato", "buckwheat"],
    stapleVeg: ["broccoli", "spinach", "kale", "sweet-corn", "carrot", "tomato", "bell-pepper", "avocado", "cauliflower", "mushroom"],
    stapleFats: ["olive-oil", "avocado", "almonds", "walnuts", "chia-seeds", "flaxseed", "peanut-butter"],
    supplements: [
      { name: "Vitamin D", reason: "Despite sunshine, indoor lifestyles and high skin cancer awareness reduce sun exposure; 1,000 IU/day if deficient (Endocrine Society 2024)." },
      { name: "Omega-3 (fish oil)", reason: "If fish intake is low; 1 g EPA+DHA/day (NHMRC 2019)." },
    ],
    waterNote: "2.5 L/day (men), 2.1 L/day (women) — NHMRC 2011. Higher in summer and during outdoor activities.",
  },
};

// ── Region lookup helpers ──────────────────────────────────────────────────

export function regionForCountry(countryId: string): Region {
  const country = COUNTRIES.find((c) => c.id === countryId);
  return country?.region ?? "global";
}

export function guidanceForRegion(region: Region): RegionalGuidance {
  return REGIONAL_GUIDANCE[region] ?? REGIONAL_GUIDANCE.global;
}

/** Merge regional staples into a list of preferred food IDs (region-first, then global). */
export function regionalStaples(region: Region): string[] {
  const g = guidanceForRegion(region);
  return [...new Set([...g.stapleProteins, ...g.stapleGrains, ...g.stapleVeg, ...g.stapleFats])];
}
