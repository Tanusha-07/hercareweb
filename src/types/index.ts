/**
 * HerCare+ shared domain types.
 *
 * Privacy note: personal health records live in per-user, per-device storage
 * (see utils/storage.ts). Nothing here is sent to a server unless the user
 * explicitly triggers a share/report action.
 */

export type Language = 'en' | 'hi' | 'kn';

/**
 * Content that must appear in every supported language lives inline as a
 * LocalizedText map (rather than a dictionary key) so article/symptom data
 * stays self-contained. UI chrome strings live in the i18n dictionaries.
 */
export type LocalizedText = Record<Language, string>;

export function pick(text: LocalizedText, lang: Language): string {
  return text[lang] ?? text.en;
}

export interface User {
  id: string;
  name: string;
  /** Normalised E.164-style Indian number, e.g. +919876543210. */
  phone: string;
  language: Language;
  createdAt: string;
  /** True once the OTP flow has verified ownership of the phone number. */
  phoneVerified: boolean;
}

export type FacilityType =
  | 'PHC'
  | 'CHC'
  | 'Government hospital'
  | 'Private hospital'
  | 'Clinic'
  | 'Doctor'
  | 'Other';

export type FacilityOwnership = 'government' | 'private';

/**
 * A healthcare facility or individual doctor in the public directory.
 *
 * IMPORTANT: only verified records should ever be shown as "verified". Demo
 * data is flagged with `isSample: true` and must never be presented as real.
 */
export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  ownership: FacilityOwnership;
  /** Free/subsidised only when verified; see `feeVerified`. */
  free: boolean;
  feeVerified: boolean;
  feeNote?: string;
  specialities: string[];
  /** True only when a female doctor's presence has been verified. */
  femaleDoctor: boolean | null;
  languages: Language[];
  /** Address + hierarchical location for manual (non-GPS) search. */
  address: string;
  state: string;
  district: string;
  block: string;
  village: string;
  phone?: string;
  hours?: string;
  imageUrl?: string;
  lat?: number;
  lng?: number;
  source?: string;
  lastVerified?: string;
  isSample: boolean;
}

export type TriageLevel = 'green' | 'amber' | 'red';

export interface TriageResult {
  level: TriageLevel;
  headline: string;
  guidance: string[];
  /** Symptom ids that pushed the result to this level. */
  triggeredBy: string[];
}

export interface Symptom {
  id: string;
  label: LocalizedText;
  icon: string;
  /** Baseline triage contribution; emergencies are 'red'. */
  severity: TriageLevel;
  category: 'general' | 'maternal' | 'elder' | 'emergency';
}

export interface PeriodEntry {
  id: string;
  start: string; // ISO date (yyyy-mm-dd)
  end?: string; // ISO date
  symptoms: string[];
  flow?: 'light' | 'medium' | 'heavy';
  createdAt: string;
}

export interface CyclePrediction {
  averageLength: number;
  nextStart: string;
  confidence: 'estimate';
}

export type MaternalRecordType = 'bp' | 'weight' | 'iron' | 'appointment' | 'milestone';

export interface MaternalEntry {
  id: string;
  type: MaternalRecordType;
  date: string;
  value?: string;
  note?: string;
  createdAt: string;
}

export type InfantRecordType = 'feeding' | 'sleep' | 'vaccination' | 'growth' | 'milestone' | 'appointment';

export interface InfantEntry {
  id: string;
  type: InfantRecordType;
  date: string;
  value?: string;
  note?: string;
  createdAt: string;
}

export interface WellnessEntry {
  id: string;
  date: string;
  hydration?: number; // glasses of water
  activityMinutes?: number;
  mood?: 'great' | 'good' | 'okay' | 'low' | 'bad';
  note?: string;
  createdAt: string;
}

export interface RecoveryLog {
  id: string;
  date: string;
  type: 'craving' | 'anxiety' | 'pain' | 'sleep' | 'win';
  intensity?: number; // 1-5
  note?: string;
  createdAt: string;
}

export interface RecoveryProfile {
  quitDate: string;
  dailySpendRupees: number;
  pinHash?: string; // optional local PIN lock; never the account credential
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relation?: string;
}

export interface Helpline {
  id: string;
  name: LocalizedText;
  number: string;
  description: LocalizedText;
  availability: 'national' | 'state';
  /** Optional external URL for more info. */
  url?: string;
}

export type AwarenessCategory = 'lifecycle' | 'prevention' | 'wellness' | 'myths';

export interface AwarenessArticle {
  id: string;
  category: AwarenessCategory;
  title: LocalizedText;
  summary: LocalizedText;
  body: LocalizedText[];
  icon: string;
  seekHelp?: LocalizedText;
  source: string;
  nextStep?: { label: LocalizedText; to: string };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** Present when the deterministic safety layer flagged an emergency. */
  emergency?: TriageResult;
  /** Illustrative media id, resolved to reviewed educational content. */
  visualId?: string;
  /** True when the answer came from curated demo content, not a live model. */
  demo?: boolean;
  createdAt: string;
}

export interface IncidentReport {
  id: string;
  category: string;
  date?: string;
  description: string;
  contact?: string;
  followUp?: 'call' | 'sms' | 'none';
  createdAt: string;
}
