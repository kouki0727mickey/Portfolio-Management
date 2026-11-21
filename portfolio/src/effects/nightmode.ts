export function setNightMode(on: boolean): void {
  document.documentElement.dataset.night = String(on);
}

export function toggleNightMode(): boolean {
  const next = document.documentElement.dataset.night !== 'true';
  setNightMode(next);
  return next;
}
