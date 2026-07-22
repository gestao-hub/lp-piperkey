import { describe, expect, test, vi } from 'vitest';
import {
  CONSENT_STATUS,
  consentStorageKey,
  createConsentManager,
} from '../../src/consent.js';

describe('versioned consent storage', () => {
  test('starts without a decision', () => {
    const manager = createConsentManager({ storage: localStorage, version: '1' });
    expect(manager.getStatus()).toBeNull();
    expect(consentStorageKey('1')).toBe('piperkey_consent_v1');
  });

  test.each([CONSENT_STATUS.accepted, CONSENT_STATUS.rejected])(
    'persists the %s decision for the active version',
    (status) => {
      const manager = createConsentManager({ storage: localStorage, version: '2' });
      manager.setStatus(status);

      expect(manager.getStatus()).toBe(status);
      expect(localStorage.getItem('piperkey_consent_v1')).toBeNull();
      expect(localStorage.getItem('piperkey_consent_v2')).toContain(status);
    },
  );

  test('does not reuse a decision from an older policy version', () => {
    createConsentManager({ storage: localStorage, version: '1' }).setStatus(CONSENT_STATUS.accepted);
    const current = createConsentManager({ storage: localStorage, version: '2' });
    expect(current.getStatus()).toBeNull();
  });

  test('treats malformed stored data as no decision', () => {
    localStorage.setItem(consentStorageKey('1'), 'not-json');
    const manager = createConsentManager({ storage: localStorage, version: '1' });
    expect(manager.getStatus()).toBeNull();
  });

  test('rejects unsupported statuses', () => {
    const manager = createConsentManager({ storage: localStorage, version: '1' });
    expect(() => manager.setStatus('implicit')).toThrow('Status de consentimento inválido');
  });

  test('calls the matching lifecycle callback after a decision', () => {
    const onAccept = vi.fn();
    const onReject = vi.fn();
    const manager = createConsentManager({ storage: localStorage, version: '1', onAccept, onReject });

    manager.setStatus(CONSENT_STATUS.accepted);
    manager.setStatus(CONSENT_STATUS.rejected);

    expect(onAccept).toHaveBeenCalledTimes(1);
    expect(onReject).toHaveBeenCalledTimes(1);
  });
});
