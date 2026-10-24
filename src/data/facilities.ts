import type { Facility, Language } from '@/types';

/**
 * SAMPLE healthcare directory — for local development and demonstration only.
 *
 * Every record here has `isSample: true`. These are NOT real, verified
 * facilities and must never be presented as such. In production, verified
 * records are imported from official public-health directories (e.g. the Health
 * Facility Registry) through the backend; the same `Facility` shape applies.
 *
 * The location cascade (state > district > block > village) is intentionally
 * small and clearly fictional to avoid implying real-world availability.
 */
export const sampleFacilities: Facility[] = [
  {
    id: 'sample-phc-1',
    name: 'Sample Primary Health Centre (demo)',
    type: 'PHC',
    ownership: 'government',
    free: true,
    feeVerified: false,
    specialities: ['General medicine', 'Maternal care', 'Immunisation'],
    femaleDoctor: null,
    languages: ['kn', 'hi', 'en'],
    address: 'Demo Main Road, Sample Village',
    state: 'Sample State',
    district: 'Sample District',
    block: 'Demo Block',
    village: 'Sample Village',
    phone: '+910000000001',
    hours: 'Mon–Sat, 9:00–17:00',
    source: 'Sample dataset',
    lastVerified: undefined,
    isSample: true,
  },
  {
    id: 'sample-chc-1',
    name: 'Sample Community Health Centre (demo)',
    type: 'CHC',
    ownership: 'government',
    free: true,
    feeVerified: false,
    specialities: ['Obstetrics', 'Paediatrics', 'Surgery'],
    femaleDoctor: true,
    languages: ['hi', 'en'],
    address: 'Demo Bazaar, Example Town',
    state: 'Sample State',
    district: 'Example District',
    block: 'Example Block',
    village: 'Example Town',
    phone: '+910000000002',
    hours: '24 hours',
    source: 'Sample dataset',
    isSample: true,
  },
  {
    id: 'sample-clinic-1',
    name: 'Demo Women’s Clinic (private)',
    type: 'Clinic',
    ownership: 'private',
    free: false,
    feeVerified: false,
    feeNote: 'Sample consultation fee ₹200',
    specialities: ['Gynaecology'],
    femaleDoctor: true,
    languages: ['en', 'hi'],
    address: 'Demo Lane, Example Town',
    state: 'Sample State',
    district: 'Example District',
    block: 'Example Block',
    village: 'Example Town',
    phone: '+910000000003',
    source: 'Sample dataset',
    isSample: true,
  },
];

export interface LocationCascade {
  states: string[];
  districtsByState: Record<string, string[]>;
  blocksByDistrict: Record<string, string[]>;
  villagesByBlock: Record<string, string[]>;
}

/** Build the cascading selectors purely from the loaded facility records. */
export function buildLocationCascade(facilities: Facility[]): LocationCascade {
  const states = new Set<string>();
  const districtsByState: Record<string, Set<string>> = {};
  const blocksByDistrict: Record<string, Set<string>> = {};
  const villagesByBlock: Record<string, Set<string>> = {};

  const pair = (map: Record<string, Set<string>>, key: string, value: string) => {
    if (!key) return;
    (map[key] ??= new Set()).add(value);
  };

  for (const f of facilities) {
    states.add(f.state);
    pair(districtsByState, f.state, f.district);
    pair(blocksByDistrict, f.district, f.block);
    pair(villagesByBlock, f.block, f.village);
  }

  const toSorted = (s: Set<string>) => [...s].sort();
  const toSortedMap = (m: Record<string, Set<string>>) =>
    Object.fromEntries(Object.entries(m).map(([k, v]) => [k, toSorted(v)]));

  return {
    states: [...states].sort(),
    districtsByState: toSortedMap(districtsByState),
    blocksByDistrict: toSortedMap(blocksByDistrict),
    villagesByBlock: toSortedMap(villagesByBlock),
  };
}

export interface FacilityFilters {
  state?: string;
  district?: string;
  block?: string;
  village?: string;
  ownership?: 'government' | 'private';
  freeOnly?: boolean;
  femaleDoctorOnly?: boolean;
  speciality?: string;
  language?: Language;
  query?: string;
}

export function filterFacilities(facilities: Facility[], f: FacilityFilters): Facility[] {
  const q = f.query?.trim().toLowerCase();
  return facilities.filter((fac) => {
    if (f.state && fac.state !== f.state) return false;
    if (f.district && fac.district !== f.district) return false;
    if (f.block && fac.block !== f.block) return false;
    if (f.village && fac.village !== f.village) return false;
    if (f.ownership && fac.ownership !== f.ownership) return false;
    if (f.freeOnly && !fac.free) return false;
    if (f.femaleDoctorOnly && fac.femaleDoctor !== true) return false;
    if (f.speciality && !fac.specialities.includes(f.speciality)) return false;
    if (f.language && !fac.languages.includes(f.language)) return false;
    if (q) {
      const hay = `${fac.name} ${fac.village} ${fac.district} ${fac.block} ${fac.specialities.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function allSpecialities(facilities: Facility[]): string[] {
  return [...new Set(facilities.flatMap((f) => f.specialities))].sort();
}
