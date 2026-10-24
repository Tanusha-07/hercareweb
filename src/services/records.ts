import type {
  CyclePrediction,
  InfantEntry,
  IncidentReport,
  MaternalEntry,
  PeriodEntry,
  RecoveryLog,
  RecoveryProfile,
  TrustedContact,
  WellnessEntry,
} from '@/types';
import { storage } from '@/utils/storage';
import { uid } from '@/utils/id';
import { addDays, diffDays, todayISO } from '@/utils/date';

/**
 * Per-user record store. Everything is scoped to the signed-in user id via
 * utils/storage, so a shared device never mixes two people's records. These
 * operations mirror what a Supabase client with row-level security would do;
 * swapping localStorage for the network client touches only this file.
 */

function list<T>(userId: string, kind: string): T[] {
  return storage.readRecords<T>(userId, kind);
}
function put<T extends { id: string }>(userId: string, kind: string, rows: T[]): void {
  storage.writeRecords(userId, kind, rows);
}

function add<T extends { id: string; createdAt: string }>(userId: string, kind: string, value: Omit<T, 'id' | 'createdAt'>): T {
  const row = { ...value, id: uid('r_'), createdAt: new Date().toISOString() } as T;
  const rows = list<T>(userId, kind);
  rows.unshift(row);
  put(userId, kind, rows);
  return row;
}

function update<T extends { id: string }>(userId: string, kind: string, id: string, patch: Partial<T>): void {
  const rows = list<T>(userId, kind).map((r) => (r.id === id ? { ...r, ...patch } : r));
  put(userId, kind, rows);
}

function remove(userId: string, kind: string, id: string): void {
  put(userId, kind, list<{ id: string }>(userId, kind).filter((r) => r.id !== id));
}

// ---- Periods -------------------------------------------------------------

export const periods = {
  all: (userId: string) => list<PeriodEntry>(userId, 'periods'),
  add: (userId: string, value: Omit<PeriodEntry, 'id' | 'createdAt'>) =>
    add<PeriodEntry>(userId, 'periods', value),
  update: (userId: string, id: string, patch: Partial<PeriodEntry>) =>
    update<PeriodEntry>(userId, 'periods', id, patch),
  remove: (userId: string, id: string) => remove(userId, 'periods', id),
  /** Simple average-cycle prediction from start dates. Clearly an estimate. */
  predict(userId: string): CyclePrediction | null {
    const starts = periods
      .all(userId)
      .map((p) => p.start)
      .sort();
    if (starts.length < 2) return null;
    const gaps: number[] = [];
    for (let i = 1; i < starts.length; i++) {
      const g = diffDays(starts[i - 1], starts[i]);
      if (g > 0 && g < 90) gaps.push(g);
    }
    if (gaps.length === 0) return null;
    const averageLength = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    const lastStart = starts[starts.length - 1];
    return {
      averageLength,
      nextStart: addDays(lastStart, averageLength),
      confidence: 'estimate',
    };
  },
};

// ---- Maternal & infant & wellness ---------------------------------------

export const maternal = {
  all: (userId: string) => list<MaternalEntry>(userId, 'maternal'),
  add: (userId: string, value: Omit<MaternalEntry, 'id' | 'createdAt'>) =>
    add<MaternalEntry>(userId, 'maternal', value),
  remove: (userId: string, id: string) => remove(userId, 'maternal', id),
};

export const infant = {
  all: (userId: string) => list<InfantEntry>(userId, 'infant'),
  add: (userId: string, value: Omit<InfantEntry, 'id' | 'createdAt'>) =>
    add<InfantEntry>(userId, 'infant', value),
  remove: (userId: string, id: string) => remove(userId, 'infant', id),
};

export const wellness = {
  all: (userId: string) => list<WellnessEntry>(userId, 'wellness'),
  add: (userId: string, value: Omit<WellnessEntry, 'id' | 'createdAt'>) =>
    add<WellnessEntry>(userId, 'wellness', value),
  remove: (userId: string, id: string) => remove(userId, 'wellness', id),
};

// ---- Recovery journal ----------------------------------------------------

export const recovery = {
  logs: (userId: string) => list<RecoveryLog>(userId, 'recovery.logs'),
  log: (userId: string, value: Omit<RecoveryLog, 'id' | 'createdAt'>) =>
    add<RecoveryLog>(userId, 'recovery.logs', value),
  clearLogs: (userId: string) => put(userId, 'recovery.logs', []),
  profile: (userId: string): RecoveryProfile | null =>
    storage.readObject<RecoveryProfile | null>(userId, 'recovery.profile', null),
  setProfile: (userId: string, value: RecoveryProfile) =>
    storage.writeObject(userId, 'recovery.profile', value),
  daysSober(userId: string): number {
    const p = recovery.profile(userId);
    if (!p) return 0;
    return Math.max(0, diffDays(p.quitDate, todayISO()));
  },
  savingsRupees(userId: string): number {
    const p = recovery.profile(userId);
    if (!p) return 0;
    return recovery.daysSober(userId) * (p.dailySpendRupees || 0);
  },
};

// ---- Trusted contacts & saved facilities --------------------------------

export const contacts = {
  all: (userId: string) => list<TrustedContact>(userId, 'contacts'),
  add: (userId: string, value: Omit<TrustedContact, 'id'>) => {
    const row = { ...value, id: uid('c_') };
    const rows = list<TrustedContact>(userId, 'contacts');
    rows.push(row);
    put(userId, 'contacts', rows);
    return row;
  },
  remove: (userId: string, id: string) => remove(userId, 'contacts', id),
};

export const savedFacilities = {
  ids: (userId: string) => storage.readRecords<string>(userId, 'savedFacilities'),
  toggle(userId: string, facilityId: string): boolean {
    const ids = storage.readRecords<string>(userId, 'savedFacilities');
    const has = ids.includes(facilityId);
    const next = has ? ids.filter((i) => i !== facilityId) : [...ids, facilityId];
    storage.writeRecords(userId, 'savedFacilities', next);
    return !has;
  },
};

// ---- Incident reports (saved privately on-device) -----------------------

export const reports = {
  all: (userId: string) => list<IncidentReport>(userId, 'reports'),
  add: (userId: string, value: Omit<IncidentReport, 'id' | 'createdAt'>) =>
    add<IncidentReport>(userId, 'reports', value),
  remove: (userId: string, id: string) => remove(userId, 'reports', id),
};
