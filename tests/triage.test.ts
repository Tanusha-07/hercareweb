import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runTriage, maxLevel } from '../src/data/symptoms';

test('an emergency symptom always returns red', () => {
  const r = runTriage({ symptomIds: ['breathing_difficulty'], duration: 'days1to3', severity: 'mild', lang: 'en' });
  assert.equal(r.level, 'red');
  assert.ok(r.triggeredBy.includes('breathing_difficulty'));
});

test('a persistent amber symptom escalates to amber', () => {
  const r = runTriage({ symptomIds: ['fever'], duration: 'longer', severity: 'moderate', lang: 'en' });
  assert.equal(r.level, 'amber');
});

test('a minor, brief complaint stays green', () => {
  const r = runTriage({ symptomIds: ['headache'], duration: 'days1to3', severity: 'mild', lang: 'en' });
  assert.equal(r.level, 'green');
});

test('triage guidance is localised', () => {
  const en = runTriage({ symptomIds: ['chest_pain'], duration: 'days1to3', severity: 'severe', lang: 'en' });
  const hi = runTriage({ symptomIds: ['chest_pain'], duration: 'days1to3', severity: 'severe', lang: 'hi' });
  assert.notEqual(en.headline, hi.headline);
  assert.ok(hi.headline.length > 0);
});

test('maxLevel ranks red above amber above green', () => {
  assert.equal(maxLevel('red', 'amber'), 'red');
  assert.equal(maxLevel('green', 'amber'), 'amber');
  assert.equal(maxLevel('green', 'green'), 'green');
});
