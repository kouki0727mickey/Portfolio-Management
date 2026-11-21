export const KONAMI: readonly string[] = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a',
];

const normalize = (key: string) => (key.length === 1 ? key.toLowerCase() : key);

export function createKonamiDetector(onMatch: () => void): (key: string) => void {
  let recent: string[] = [];
  return (key) => {
    recent.push(normalize(key));
    if (recent.length > KONAMI.length) recent = recent.slice(-KONAMI.length);
    if (recent.length === KONAMI.length && recent.every((k, i) => k === KONAMI[i])) {
      recent = [];
      onMatch();
    }
  };
}
