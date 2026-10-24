import { test } from 'node:test';
import assert from 'node:assert/strict';

// Minimal localStorage polyfill so the browser storage util works under node.
class MemoryStorage {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  key(i: number) {
    return [...this.map.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.map.set(k, v);
  }
  removeItem(k: string) {
    this.map.delete(k);
  }
  clear() {
    this.map.clear();
  }
}
(globalThis as any).localStorage = new MemoryStorage();

const { periods, contacts, savedFacilities, recovery } = await import('../src/services/records');

test("one user's records are never visible to another", () => {
  periods.add('userA', { start: '2026-01-01', symptoms: ['cramp'] });
  periods.add('userB', { start: '2026-02-02', symptoms: [] });

  assert.equal(periods.all('userA').length, 1);
  assert.equal(periods.all('userB').length, 1);
  assert.equal(periods.all('userA')[0].start, '2026-01-01');
  assert.notEqual(periods.all('userA')[0].start, periods.all('userB')[0].start);
});

test('a new, unrelated user sees no data', () => {
  assert.equal(periods.all('userC').length, 0);
});

test('saved facilities toggle independently per user', () => {
  assert.equal(savedFacilities.toggle('userA', 'fac-1'), true);
  assert.equal(savedFacilities.ids('userA').includes('fac-1'), true);
  assert.equal(savedFacilities.ids('userB').includes('fac-1'), false);
  assert.equal(savedFacilities.toggle('userA', 'fac-1'), false);
  assert.equal(savedFacilities.ids('userA').includes('fac-1'), false);
});

test('recovery savings are derived from the profile', () => {
  const futureQuit = new Date(Date.now() - 3 * 86_400_000).toISOString().slice(0, 10);
  recovery.setProfile('userA', { quitDate: futureQuit, dailySpendRupees: 50 });
  assert.ok(recovery.daysSober('userA') >= 3);
  assert.ok(recovery.savingsRupees('userA') >= 150);
});

test('trusted contacts are per-user', () => {
  contacts.add('userA', { name: 'Asha', phone: '+919876500001' });
  assert.equal(contacts.all('userA').length, 1);
  assert.equal(contacts.all('userB').length, 0);
});
