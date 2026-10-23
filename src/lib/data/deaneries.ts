// Full UK postgraduate deanery/Local Office list for onboarding's general "which deanery" question.
// Not the same list as PROGRAMME_REGIONS (src/lib/data/region-mapping.ts): that one is scoped to
// what the IMT regional-competitiveness dataset can actually differentiate (single "Scotland"
// bucket), and stays as-is so the likelihood tool's region selector matches its real data. This
// list is for general profile accuracy and includes Scotland's 4 real deanery regions.
//
// England's 13 Local Offices (NHS England specialty recruitment grouping) and Wales/Northern
// Ireland (each a single unified deanery, HEIW/Wales Deanery, NIMDTA) were already correct.
// Scotland was the actual gap: NHS Education for Scotland (NES) runs 4 regional deaneries, not one.

export const UK_DEANERIES = [
  "East Midlands",
  "East of England",
  "Kent, Surrey and Sussex",
  "London",
  "North East",
  "North West",
  "South West",
  "Thames Valley",
  "Wessex",
  "West Midlands",
  "Yorkshire and the Humber",
  "Scotland - East",
  "Scotland - North",
  "Scotland - South East",
  "Scotland - West",
  "Wales",
  "Northern Ireland",
] as const;

export type UkDeanery = (typeof UK_DEANERIES)[number];
