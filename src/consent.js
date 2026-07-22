export const CONSENT_STATUS = Object.freeze({
  accepted: 'accepted',
  rejected: 'rejected',
});

const allowedStatuses = new Set(Object.values(CONSENT_STATUS));

export function consentStorageKey(version) {
  return `piperkey_consent_v${version}`;
}

export function createConsentManager({
  storage,
  version,
  onAccept = () => {},
  onReject = () => {},
}) {
  const key = consentStorageKey(version);

  function getStatus() {
    try {
      const value = JSON.parse(storage.getItem(key));
      if (value?.version !== version || !allowedStatuses.has(value?.status)) return null;
      return value.status;
    } catch {
      return null;
    }
  }

  function setStatus(status) {
    if (!allowedStatuses.has(status)) {
      throw new Error(`Status de consentimento inválido: ${status}`);
    }

    storage.setItem(
      key,
      JSON.stringify({
        version,
        status,
        updatedAt: new Date().toISOString(),
      }),
    );

    if (status === CONSENT_STATUS.accepted) onAccept();
    if (status === CONSENT_STATUS.rejected) onReject();
    return status;
  }

  function clear() {
    storage.removeItem(key);
  }

  return Object.freeze({ getStatus, setStatus, clear });
}
